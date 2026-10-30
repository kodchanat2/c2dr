// Realistic rigged hand (WebXR generic-hand, MIT, Amazon) rendered with the toon look.
// The model is normalised so that fingers point +Y and the palm faces -Z; finger curl follows that convention.
import { useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { continueRender, delayRender, staticFile } from "remotion";
import { GEO, ToonMesh, useToonMaterial } from "./toon";

export const SKIN = "#d9a47c";
const MODEL_SCALE = 7.5; // model is in metres (~0.19 m long)

const FINGERS = ["index-finger", "middle-finger", "ring-finger", "pinky-finger"] as const;
const SEGMENTS = ["phalanx-proximal", "phalanx-intermediate", "phalanx-distal"] as const;

export interface SkinPose {
  curl: [number, number, number, number]; // radians per joint for index..pinky
  spread?: number;
  thumb: { curl: number; across: number };
}

export const SKIN_POSES = {
  relaxed: { curl: [0.25, 0.3, 0.35, 0.4], spread: 0.06, thumb: { curl: 0.15, across: 0.1 } },
  grip: { curl: [0.75, 0.8, 0.85, 0.9], spread: 0.02, thumb: { curl: 0.15, across: 0.35 } },
  point: { curl: [0.05, 1.35, 1.4, 1.45], spread: 0.0, thumb: { curl: 0.7, across: 0.6 } },
  reach: { curl: [0.35, 0.4, 0.45, 0.5], spread: 0.12, thumb: { curl: 0.2, across: 0.15 } },
  phone: { curl: [0.55, 0.6, 0.65, 0.7], spread: 0.04, thumb: { curl: 0.1, across: 0.75 } },
} satisfies Record<string, SkinPose>;

// Load both hand models once at module import, blocking the first frame via delayRender.
// (A delayRender started inside the R3F tree was not awaited by the still renderer.)
const loaded = new Map<"left" | "right", THREE.Group>();
const preloadHandle = typeof window === "undefined" ? null : delayRender("load hand models");
if (preloadHandle !== null) {
  const loader = new GLTFLoader();
  Promise.all(
    (["left", "right"] as const).map((side) => loader.loadAsync(staticFile(`models/hands/${side}.glb`)).then((g) => loaded.set(side, g.scene))),
  )
    .then(() => continueRender(preloadHandle))
    .catch((err) => {
      console.error("Failed to load hand models", err);
      continueRender(preloadHandle);
    });
}

function useHandScene(side: "left" | "right"): THREE.Group | null {
  const source = loaded.get(side);
  return useMemo(() => (source ? (cloneSkinned(source) as THREE.Group) : null), [source]);
}

/** Rotation that maps wrist→middle-finger onto +Y and the palm normal onto -Z. */
function normaliseFrame(scene: THREE.Group, side: "left" | "right"): THREE.Quaternion {
  scene.updateMatrixWorld(true);
  const p = (name: string) => scene.getObjectByName(name)?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3();
  const wrist = p("wrist");
  const up = p("middle-finger-metacarpal").sub(wrist).normalize();
  // index→pinky is mirrored between hands; flip it on the left so both palms end up on the same side
  const across = p("index-finger-metacarpal").sub(p("pinky-finger-metacarpal")).multiplyScalar(side === "left" ? -1 : 1).normalize();
  const palm = new THREE.Vector3().crossVectors(across, up).normalize();
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(up, palm), up, palm);
  return new THREE.Quaternion().setFromRotationMatrix(basis).invert();
}

const CURL_AXIS = new THREE.Vector3(1, 0, 0); // probed: local +X bends toward the palm
const SPREAD_AXIS = new THREE.Vector3(0, 0, 1);

interface Rest {
  q: THREE.Quaternion;
  p: THREE.Vector3;
}

const FINGER_CHAINS = FINGERS.map((f) => [`${f}-metacarpal`, ...SEGMENTS.map((s) => `${f}-${s}`), `${f}-tip`]);
const THUMB_CHAIN = ["thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"];

/**
 * The WebXR hand rig has no joint hierarchy (every joint is a direct child of the armature, posed by the XR
 * runtime), so rotating a knuckle does not carry the rest of the finger. Do forward kinematics by hand:
 * accumulate each joint's delta rotation down the chain and re-place the child joints.
 */
function poseChain(scene: THREE.Group, chain: string[], angles: { curl: number; spread: number }[], rest: Map<string, Rest>) {
  const delta = new THREE.Quaternion();
  let prevRest: Rest | undefined;
  let prevPos: THREE.Vector3 | undefined;
  chain.forEach((name, k) => {
    const bone = scene.getObjectByName(name);
    const r = rest.get(name);
    if (!bone || !r) return;
    const pos = prevRest && prevPos ? prevPos.clone().add(r.p.clone().sub(prevRest.p).applyQuaternion(delta)) : r.p.clone();
    const a = angles[k];
    if (a) {
      const local = new THREE.Quaternion().setFromAxisAngle(CURL_AXIS, a.curl).multiply(new THREE.Quaternion().setFromAxisAngle(SPREAD_AXIS, a.spread));
      // world-space delta of this joint = restQ * local * restQ^-1
      delta.multiply(r.q.clone().multiply(local).multiply(r.q.clone().invert()));
    }
    bone.position.copy(pos);
    bone.quaternion.copy(delta.clone().multiply(r.q));
    prevRest = r;
    prevPos = pos;
  });
}

function applyPose(scene: THREE.Group, pose: SkinPose, mirror: boolean, rest: Map<string, Rest>) {
  const side = mirror ? -1 : 1;
  FINGER_CHAINS.forEach((chain, i) => {
    const c = pose.curl[i];
    poseChain(scene, chain, [{ curl: 0, spread: 0 }, { curl: c, spread: (i - 1.5) * (pose.spread ?? 0) * side }, { curl: c * 1.1, spread: 0 }, { curl: c * 0.8, spread: 0 }], rest);
  });
  poseChain(scene, THUMB_CHAIN, [{ curl: 0, spread: pose.thumb.across * side }, { curl: pose.thumb.curl, spread: 0 }, { curl: pose.thumb.curl * 1.2, spread: 0 }], rest);
}

interface SkinnedHandProps {
  side: "left" | "right";
  pose: SkinPose;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  sleeve?: string;
  forearm?: number;
}

export function SkinnedHand({ side, pose, position, rotation, scale = 1, sleeve = "#46546f", forearm = 3 }: SkinnedHandProps) {
  const scene = useHandScene(side);
  const skinMat = useToonMaterial(SKIN);
  const setup = useMemo(() => {
    if (!scene) return null;
    const rest = new Map<string, Rest>();
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) rest.set(o.name, { q: o.quaternion.clone(), p: o.position.clone() });
    });
    const mesh = scene.getObjectByProperty("type", "SkinnedMesh") as THREE.SkinnedMesh | undefined;
    if (mesh) {
      mesh.material = skinMat;
      mesh.frustumCulled = false;
    }
    scene.updateMatrixWorld(true);
    const wrist = scene.getObjectByName("wrist")?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3();
    return { rest, frame: normaliseFrame(scene, side), offset: wrist.negate() };
  }, [scene, skinMat, side]);

  if (!scene || !setup) return null;
  applyPose(scene, pose, side === "left", setup.rest);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group quaternion={setup.frame} scale={MODEL_SCALE}>
        {/* put the wrist at the origin so the forearm attaches cleanly */}
        <group position={setup.offset}>
          <primitive object={scene} />
        </group>
      </group>
      <ToonMesh geometry={GEO.capsule} color={SKIN} outline={false} position={[0, -forearm / 2 + 0.05, 0]} scale={[0.3, forearm / 2, 0.22]} />
      <ToonMesh geometry={GEO.cylinder} color={sleeve} position={[0, -0.5 - forearm * 0.75, 0]} scale={[0.58, forearm * 0.9, 0.44]} />
    </group>
  );
}
