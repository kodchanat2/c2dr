import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONTS } from "../../theme";

// Deterministic pseudo-random so scenes render identically every frame/render
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Film grain: animated fractal noise, re-seeded every 2 frames. */
export function Grain({ opacity = 0.09 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  return (
    <svg width={720} height={1280} style={{ position: "absolute", mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(frame / 2)} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={720} height={1280} filter="url(#grain)" />
    </svg>
  );
}

export function Vignette({ strength = 0.55 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(ellipse 75% 60% at 50% 45%, transparent 55%, rgba(5,7,15,${strength}) 100%)`, pointerEvents: "none" }}
    />
  );
}

interface DepthLayerProps {
  blur: number;
  parallax?: number; // px of drift across the shot (camera truck)
  tint?: string; // atmospheric haze colour blended over the layer
  tintOpacity?: number;
  children: ReactNode;
}

/** One plane of depth: blurred by distance, hazed toward the sky colour, drifts with the camera. */
export function DepthLayer({ blur, parallax = 0, tint, tintOpacity = 0, children }: DepthLayerProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [0, -parallax]);
  const style: CSSProperties = { transform: `translateX(${x}px)`, filter: blur ? `blur(${blur}px)` : undefined };
  return (
    <AbsoluteFill style={style}>
      {children}
      {tint && <AbsoluteFill style={{ background: tint, opacity: tintOpacity, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
}

/** Cinematic grade applied to a whole scene. */
export function Graded({ children, warmth = 0 }: { children: ReactNode; warmth?: number }) {
  return (
    <AbsoluteFill style={{ filter: `saturate(0.86) contrast(1.06) sepia(${warmth})` }}>
      {children}
    </AbsoluteFill>
  );
}

/** Dark pill "• หัวข้อ · หัวข้อย่อย" + EN caps line, as in the references' top-left chrome. */
export function HeaderChip({ th, en, top = 40 }: { th: string; en: string; top?: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top, left: 30, right: 110, display: "flex", alignItems: "center", gap: 10, opacity: o }}>
      <div style={{ background: "rgba(10,12,22,0.82)", borderRadius: 999, padding: "6px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: COLORS.yellow }} />
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 19, color: COLORS.cream, whiteSpace: "nowrap" }}>{th}</span>
      </div>
      <span style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 13, letterSpacing: 1.6, color: COLORS.blueprint, whiteSpace: "nowrap" }}>{en.toUpperCase()}</span>
    </div>
  );
}

/** Small editorial footer line: Thai name · scientific/EN name on the left, a tag on the right. */
export function FooterCaption({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ position: "absolute", bottom: 64, left: 30, right: 30, display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(244,233,212,0.25)", paddingTop: 10 }}>
      <span style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 16, color: "rgba(244,233,212,0.75)" }}>{left}</span>
      <span style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 12, letterSpacing: 1.6, color: "rgba(244,233,212,0.6)" }}>{right.toUpperCase()}</span>
    </div>
  );
}
