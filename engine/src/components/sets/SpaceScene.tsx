import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { FooterCaption, HeaderChip } from "../style/StyleKit";
import { ArcArrow, EarthGlobe, MoonDisc } from "./celestial";

export interface SpaceSceneProps {
  // 1 = prograde (same direction as Earth's spin), -1 = retrograde
  moonDir: 1 | -1;
  orbitDegPerSec?: number;
  flipAt?: number; // frame where the orbit reverses into moonDir (glitch effect)
  trail?: boolean;
  distance?: boolean;
  rope?: { snapAt?: number };
  freezeAt?: number;
  zoom?: [number, number];
  zoomOrigin?: [number, number];
  stamp?: string;
  moonLabel?: string;
  overlay?: ReactNode;
  header?: { th: string; en: string };
  footer?: { left: string; right: string };
}

const EARTH = { x: 360, y: 500, r: 78 };
const ORBIT_R = 235;
const MOON_R = 26;
const GLITCH_FRAMES = 8;

function Grid() {
  const minor = Array.from({ length: 49 }, (_, i) => i * 30);
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {minor.map((v) => (
        <g key={v} stroke={COLORS.blueprint} strokeOpacity={v % 120 === 0 ? 0.16 : 0.06} strokeWidth={1}>
          <line x1={v} y1={0} x2={v} y2={1280} />
          <line x1={0} y1={v} x2={720} y2={v} />
        </g>
      ))}
    </svg>
  );
}

function moonAngle(frame: number, fps: number, dir: 1 | -1, speed: number, flipAt?: number, freezeAt?: number): number {
  const f = freezeAt !== undefined ? Math.min(frame, freezeAt) : frame;
  // On screen, prograde (counter-clockwise seen from north) is a decreasing SVG angle
  const sign = (d: number) => -d;
  if (flipAt === undefined || f <= flipAt) {
    const d = flipAt === undefined ? dir : (-dir as 1 | -1);
    return -90 + (sign(d) * speed * f) / fps;
  }
  const atFlip = -90 + (sign(-dir) * speed * flipAt) / fps;
  return atFlip + (sign(dir) * speed * (f - flipAt)) / fps;
}

export function SpaceScene(props: SpaceSceneProps) {
  const { moonDir, orbitDegPerSec = 40, flipAt, trail, distance, rope, freezeAt, zoom = [1, 1.06], zoomOrigin = [360, 500], stamp, moonLabel, overlay, header, footer } = props;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const angle = moonAngle(frame, fps, moonDir, orbitDegPerSec, flipAt, freezeAt);
  const rad = (angle * Math.PI) / 180;
  let mx = EARTH.x + ORBIT_R * Math.cos(rad);
  let my = EARTH.y + ORBIT_R * Math.sin(rad);

  const snapped = rope?.snapAt !== undefined && frame >= rope.snapAt;
  if (snapped && rope?.snapAt !== undefined) {
    const t = (frame - rope.snapAt) / fps;
    const tangent = rad + (moonDir === 1 ? -Math.PI / 2 : Math.PI / 2);
    const travel = 900 * t * t + 260 * t;
    const a0 = (moonAngle(rope.snapAt, fps, moonDir, orbitDegPerSec, flipAt, freezeAt) * Math.PI) / 180;
    mx = EARTH.x + ORBIT_R * Math.cos(a0) + travel * Math.cos(tangent);
    my = EARTH.y + ORBIT_R * Math.sin(a0) + travel * Math.sin(tangent);
  }

  const glitching = flipAt !== undefined && frame >= flipAt && frame < flipAt + GLITCH_FRAMES;
  const jitter = glitching ? Math.sin(frame * 7.3) * 14 : 0;
  const dirNow = flipAt !== undefined && frame < flipAt ? -moonDir : moonDir;
  const arrowColor = dirNow === 1 ? COLORS.blueprint : COLORS.red;
  const scale = interpolate(frame, [0, durationInFrames], zoom);
  const ropeTension = rope ? 0.5 + 0.5 * Math.sin(frame / 2.5) : 0;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, #23406e, ${COLORS.navy} 45%, ${COLORS.navyDeep})` }}>
      <Grid />
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${jitter}px)`, transformOrigin: `${zoomOrigin[0]}px ${zoomOrigin[1]}px`, filter: glitching ? "hue-rotate(90deg) saturate(2)" : undefined }}>
        <svg width={720} height={1280}>
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={(i * 137) % 720} cy={(i * 89) % 1280} r={i % 5 === 0 ? 1.8 : 1} fill="#fff" opacity={0.25 + (i % 3) * 0.15} />
          ))}
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r * 1.5} fill="url(#atmo)" />
          <defs>
            <radialGradient id="atmo">
              <stop offset="55%" stopColor="#5aa0ff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5aa0ff" stopOpacity={0} />
            </radialGradient>
          </defs>
          <text x={EARTH.x} y={EARTH.y + EARTH.r + 44} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={22} fill={COLORS.cream}>
            โลก
          </text>
          <text x={EARTH.x} y={EARTH.y + EARTH.r + 64} textAnchor="middle" fontFamily={FONTS.caps} fontWeight={600} fontSize={11} letterSpacing={2} fill={COLORS.blueprint}>
            EARTH
          </text>
          <circle cx={EARTH.x} cy={EARTH.y} r={ORBIT_R} fill="none" stroke={COLORS.blueprint} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="6 10" style={{ filter: "drop-shadow(0 0 4px rgba(127,167,217,0.8))" }} />
          {/* Earth spin: always counter-clockwise */}
          <ArcArrow cx={EARTH.x} cy={EARTH.y} r={EARTH.r + 22} a0={60} a1={-30} color={COLORS.blueprint} width={3} />
          <EarthGlobe cx={EARTH.x} cy={EARTH.y} r={EARTH.r} spin={-frame * 2} />
          {!snapped && (
            <g opacity={0.9}>
              {dirNow === 1 ? (
                <ArcArrow cx={EARTH.x} cy={EARTH.y} r={ORBIT_R + 26} a0={angle + 40} a1={angle + 5} color={arrowColor} width={5} />
              ) : (
                <ArcArrow cx={EARTH.x} cy={EARTH.y} r={ORBIT_R + 26} a0={angle - 40} a1={angle - 5} color={arrowColor} width={5} />
              )}
            </g>
          )}
          {trail && !snapped &&
            Array.from({ length: 10 }, (_, i) => {
              const a = ((angle + (dirNow === 1 ? 1 : -1) * (i + 1) * 4) * Math.PI) / 180;
              return <circle key={i} cx={EARTH.x + ORBIT_R * Math.cos(a)} cy={EARTH.y + ORBIT_R * Math.sin(a)} r={MOON_R * (1 - i * 0.08)} fill={COLORS.moon} opacity={0.35 - i * 0.03} />;
            })}
          {rope && !snapped && (
            <line x1={EARTH.x} y1={EARTH.y} x2={mx} y2={my} stroke={COLORS.red} strokeWidth={3 + ropeTension * 3} strokeDasharray={ropeTension > 0.7 ? "14 6" : undefined} opacity={0.9} />
          )}
          {snapped && rope?.snapAt !== undefined && (
            <line x1={EARTH.x} y1={EARTH.y} x2={EARTH.x + (mx - EARTH.x) * Math.max(0, 0.35 - (frame - rope.snapAt) / 30)} y2={EARTH.y + (my - EARTH.y) * Math.max(0, 0.35 - (frame - rope.snapAt) / 30)} stroke={COLORS.red} strokeWidth={4} />
          )}
          {distance && (
            <g stroke={COLORS.yellow} strokeWidth={3} opacity={interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" })}>
              <line x1={EARTH.x} y1={EARTH.y} x2={EARTH.x + (mx - EARTH.x) * interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" })} y2={EARTH.y + (my - EARTH.y) * interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" })} strokeDasharray="10 8" />
            </g>
          )}
          <MoonDisc cx={mx} cy={my} r={MOON_R} phase={0.5} glow={10} />
          {!moonLabel && !snapped && (
            <text x={mx} y={my + MOON_R + 26} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={18} fill={COLORS.cream} opacity={0.85}>
              ดวงจันทร์
            </text>
          )}
          {moonLabel && !snapped && (
            <text x={mx} y={my - MOON_R - 16} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={26} fill={COLORS.yellow}>
              {moonLabel}
            </text>
          )}
        </svg>
      </AbsoluteFill>
      {stamp && <Stamp text={stamp} />}
      {overlay}
      {header && <HeaderChip th={header.th} en={header.en} top={40} />}
      {footer && <FooterCaption left={footer.left} right={footer.right} />}
    </AbsoluteFill>
  );
}

function Stamp({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const start = Math.round(durationInFrames * 0.35);
  const s = interpolate(frame, [start, start + 6], [2.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(frame, [start, start + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${s}) rotate(-8deg)`, border: `6px solid ${COLORS.red}`, color: COLORS.red, borderRadius: 16, padding: "4px 28px", fontFamily: FONTS.display, fontWeight: 800, fontSize: 72, background: "rgba(20,26,46,0.6)" }}>
        {text}
      </div>
    </div>
  );
}
