// Toon phone held in two hands; the screen is a CanvasTexture redrawn every frame from useCurrentFrame().
import { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { FONTS } from "../../theme";
import { SkinnedHand, SKIN_POSES } from "./SkinnedHand";
import { ToonLights, ToonMesh, ToonStage, roundedSlab } from "./toon";

const SCREEN_PX = { w: 540, h: 1100 };
const PHONE = { w: 2.3, h: 4.7, d: 0.22 };

export type ScreenMode = "lock" | "dead" | "cracked";

function drawLock(ctx: CanvasRenderingContext2D, frame: number) {
  const { w, h } = SCREEN_PX;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#2d3360");
  g.addColorStop(1, "#11132a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `500 26px ${FONTS.body}`;
  ctx.fillText("พฤหัสบดี 24 ตุลาคม", w / 2, 170);
  ctx.font = `700 150px ${FONTS.display}`;
  ctx.fillText("03:12", w / 2, 320);
  [["#e5484d", "แจ้งเตือนฉุกเฉิน", "EMERGENCY ALERT"], ["#3a7bd5", "ข่าวด่วน", "BREAKING"]].forEach(([c, th, en], i) => {
    const a = Math.min(1, Math.max(0, (frame - i * 6) / 6));
    ctx.globalAlpha = a;
    const y = 400 + i * 120;
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.roundRect(40, y, w - 80, 100, 24);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(64, y + 25, 50, 50, 12);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = `700 28px ${FONTS.body}`;
    ctx.fillText(th, 134, y + 50);
    ctx.font = `600 16px ${FONTS.caps}`;
    ctx.fillText(en, 134, y + 78);
    ctx.textAlign = "center";
    ctx.globalAlpha = 1;
  });
}

function drawCracks(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#06070a";
  ctx.fillRect(0, 0, SCREEN_PX.w, SCREEN_PX.h);
  ctx.strokeStyle = "rgba(190,196,210,0.6)";
  ctx.lineWidth = 2.5;
  const c = [330, 460];
  const rays: [number, number][] = [[200, 180], [90, 20], [520, 230], [430, 900], [380, 1100], [60, 700], [0, 820], [540, 560], [150, 300]];
  rays.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    ctx.lineTo((c[0] + x) / 2 + 20, (c[1] + y) / 2 - 15);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(c[0], c[1], 18, 0, Math.PI * 2);
  ctx.stroke();
}

function useScreenTexture(mode: ScreenMode, deadAt: number): THREE.CanvasTexture {
  const frame = useCurrentFrame();
  const { canvas, texture } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = SCREEN_PX.w;
    cv.height = SCREEN_PX.h;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: cv, texture: tex };
  }, []);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const flickerOff = mode === "lock" && frame > deadAt - 8 && frame < deadAt && frame % 2 === 0;
    if (mode === "cracked") drawCracks(ctx);
    else if (mode === "dead" || frame >= deadAt || flickerOff) {
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, SCREEN_PX.w, SCREEN_PX.h);
    } else drawLock(ctx, frame);
    texture.needsUpdate = true;
  }
  return texture;
}

export function PhoneInHands({ mode, deadAt = 9999 }: { mode: ScreenMode; deadAt?: number }) {
  const frame = useCurrentFrame();
  const body = useMemo(() => roundedSlab(PHONE.w, PHONE.h, PHONE.d, 0.32), []);
  const screenGeo = useMemo(() => new THREE.PlaneGeometry(PHONE.w * 0.92, PHONE.h * 0.95), []);
  const texture = useScreenTexture(mode, deadAt);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]);
  const sway = Math.sin(frame / 22) * 0.04;
  return (
    <ToonStage camera={[0, 0, 13]} fov={34}>
      <ToonLights rimIntensity={2.2} />
      <group rotation={[0.08 + sway * 0.3, sway, 0]} position={[0, 0.6, 0]}>
        <ToonMesh geometry={body} color="#24262e" />
        <mesh geometry={screenGeo} material={screenMat} position={[0, 0, PHONE.d * 0.9]} />
        {/* side hands: palms face the camera, thumbs rest on the screen edge, fingers curl behind */}
        {/* palms face the camera from behind the phone; curled fingers wrap its edges, thumbs rest on the screen */}
        <SkinnedHand side="left" pose={SKIN_POSES.phone} position={[-1.25, -2.75, 0.35]} rotation={[0.2, 0.25, -0.6]} scale={1.4} sleeve="#46546f" forearm={4} />
        <SkinnedHand side="right" pose={SKIN_POSES.phone} position={[1.25, -2.75, 0.35]} rotation={[0.2, -0.25, 0.6]} scale={1.4} sleeve="#46546f" forearm={4} />
      </group>
    </ToonStage>
  );
}
