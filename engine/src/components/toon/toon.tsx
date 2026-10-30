// Toon-shading kit: 3D geometry that reads as 2D cel animation (banded light + ink outline).
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";

const OUTLINE_SCALE = 1.035;

/** 3-band gradient map (shadow / mid / light) with hard steps, the core of the 2D look. */
function makeGradient(bands: number[]): THREE.DataTexture {
  const data = new Uint8Array(bands.length * 4);
  bands.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  const tex = new THREE.DataTexture(data, bands.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const GRADIENT = makeGradient([90, 175, 255]);
const SOFT_GRADIENT = makeGradient([150, 205, 240]);

export function useToonMaterial(color: string, opts: { opacity?: number; emissive?: string; soft?: boolean } = {}): THREE.MeshToonMaterial {
  const { opacity = 1, emissive = "#000000", soft = false } = opts;
  const translucent = opacity < 1;
  const material = useMemo(
    () => new THREE.MeshToonMaterial({ color, gradientMap: soft ? SOFT_GRADIENT : GRADIENT, transparent: translucent, emissive, depthWrite: !translucent }),
    [color, emissive, translucent, soft],
  );
  // Opacity animates per frame; mutate the cached material instead of allocating a new one each frame
  material.opacity = opacity;
  return material;
}

const OUTLINE_MATERIAL = new THREE.MeshBasicMaterial({ color: "#14110f", side: THREE.BackSide });

interface ToonMeshProps {
  geometry: THREE.BufferGeometry;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  outline?: boolean;
  opacity?: number;
  emissive?: string;
  soft?: boolean; // low-contrast bands, for smoke and soft materials
  children?: ReactNode;
}

/** Mesh + inverted-hull outline. */
export function ToonMesh({ geometry, color, position, rotation, scale = 1, outline = true, opacity, emissive, soft, children }: ToonMeshProps) {
  const material = useToonMaterial(color, { opacity, emissive, soft });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={material} />
      {outline && <mesh geometry={geometry} material={OUTLINE_MATERIAL} scale={OUTLINE_SCALE} />}
      {children}
    </group>
  );
}

/** Key light from top-left, warm fill, cool rim from behind (gives the lit edge the references have). */
export function ToonLights({ keyColor = "#fff4e6", rim = "#9fc3ff", rimIntensity = 1.6 }: { keyColor?: string; rim?: string; rimIntensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-3, 4, 5]} intensity={1.9} color={keyColor} />
      <directionalLight position={[2, 1, -5]} intensity={rimIntensity} color={rim} />
    </>
  );
}

export function ToonStage({ children, width = 720, height = 1280, fov = 32, camera = [0, 0, 10] as [number, number, number], style }: { children: ReactNode; width?: number; height?: number; fov?: number; camera?: [number, number, number]; style?: React.CSSProperties }) {
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", ...style }} camera={{ fov, position: camera }} gl={{ antialias: true, alpha: true }}>
      {children}
    </ThreeCanvas>
  );
}

// Shared geometries (created once)
export const GEO = {
  capsule: new THREE.CapsuleGeometry(0.5, 1, 6, 16),
  sphere: new THREE.SphereGeometry(0.5, 24, 16),
  puff: new THREE.IcosahedronGeometry(0.5, 2),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 24),
};

export function roundedSlab(w: number, h: number, depth: number, r: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: r * 0.25, bevelSegments: 4, curveSegments: 12 });
  g.center();
  return g;
}
