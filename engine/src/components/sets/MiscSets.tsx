import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { MoonDisc } from "./celestial";
import { arcPoint } from "./RooftopScene";
import brand from "@config/brand.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NAVY_BG = `radial-gradient(circle at 50% 40%, ${COLORS.navy}, ${COLORS.navyDeep})`;

export function PhaseStripScene() {
  const frame = useCurrentFrame();
  const phases = [0.04, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <svg width={720} height={1280}>
        {phases.map((ph, i) => {
          const o = interpolate(frame, [i * 3, i * 3 + 6], [0, 1], clamp);
          return (
            <g key={i} opacity={o} transform={`translate(0 ${(1 - o) * 30})`}>
              <MoonDisc cx={60 + i * 86} cy={520} r={34} phase={ph} glow={8} />
            </g>
          );
        })}
        <line x1={40} y1={600} x2={40 + 640 * interpolate(frame, [0, 30], [0, 1], clamp)} y2={600} stroke={COLORS.yellow} strokeWidth={4} />
        <text x={360} y={660} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={30} fill={COLORS.cream}>
          00:00 → 24:00
        </text>
      </svg>
    </AbsoluteFill>
  );
}

function MiniSky({ label, night }: { label: string; night: boolean }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 70], [0.02, 0.18], clamp);
  const [x, y] = arcPoint(t);
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", background: night ? "linear-gradient(#0b1026,#2a3570)" : "linear-gradient(#5ea6e0,#cfe8f7)" }}>
      <svg width={720} height={1280} style={{ position: "absolute", left: -180 }}>
        <MoonDisc cx={x + 120} cy={y} r={40} phase={night ? 0.4 : 0.1} glow={night ? 20 : 0} />
        <rect x={0} y={800} width={720} height={480} fill="#1a2140" />
      </svg>
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", fontFamily: FONTS.display, fontWeight: 800, fontSize: 56, color: COLORS.cream, textShadow: "0 3px 0 rgba(0,0,0,0.5)" }}>
        {label}
      </div>
    </div>
  );
}

export function SplitMoonriseScene() {
  return (
    <AbsoluteFill style={{ flexDirection: "row", gap: 6, background: COLORS.navyDeep }}>
      <MiniSky label="09:00" night={false} />
      <MiniSky label="21:00" night />
    </AbsoluteFill>
  );
}

export function BeachScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const level = Math.sin((frame / fps) * Math.PI * 2 * 1.2) * 70;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#5aa8e3, #d7ecf7)" }}>
      <svg width={720} height={1280}>
        <circle cx={560} cy={260} r={50} fill={COLORS.sun} />
        <rect x={0} y={900} width={720} height={380} fill="#e8d3a2" />
        <g transform={`translate(0 ${level})`}>
          <path d={`M 0 780 Q 180 ${760 + Math.sin(frame / 4) * 12} 360 780 T 720 780 L 720 1280 L 0 1280 Z`} fill="#3a7bd5" opacity={0.92} />
        </g>
        <rect x={180} y={560} width={26} height={520} fill={COLORS.cream} stroke={COLORS.ink} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={180} y1={600 + i * 48} x2={206} y2={600 + i * 48} stroke={COLORS.red} strokeWidth={4} />
        ))}
        <g transform="translate(560 1080)">
          <circle r={70} fill={COLORS.cream} stroke={COLORS.ink} strokeWidth={5} />
          <line x1={0} y1={0} x2={0} y2={-52} stroke={COLORS.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${frame * 24})`} />
          <line x1={0} y1={0} x2={0} y2={-34} stroke={COLORS.red} strokeWidth={7} strokeLinecap="round" transform={`rotate(${frame * 2})`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
}

export function NeptuneScene({ spiral }: { spiral: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pan = interpolate(frame, [0, 20], [-120, 0], clamp);
  const tighten = spiral ? interpolate(frame, [0, durationInFrames], [1, 0.55]) : 1;
  const orbitR = 240 * tighten;
  const a = (frame * 3 * Math.PI) / 180; // clockwise on screen = retrograde
  const spiralPath = Array.from({ length: 160 }, (_, i) => {
    const th = (i / 160) * Math.PI * 6;
    const r = 260 - (i / 160) * 170;
    return `${i ? "L" : "M"} ${360 + r * Math.cos(th)} ${520 + r * 0.38 * Math.sin(th)}`;
  }).join(" ");
  return (
    <AbsoluteFill style={{ background: NAVY_BG, transform: `translateY(${pan}px)` }}>
      <svg width={720} height={1280}>
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={(i * 131) % 720} cy={(i * 71) % 1280} r={1.4} fill="#fff" opacity={0.6} />
        ))}
        {spiral && <path d={spiralPath} fill="none" stroke={COLORS.red} strokeWidth={2.5} strokeDasharray="8 8" opacity={0.7} />}
        <ellipse cx={360} cy={520} rx={orbitR} ry={orbitR * 0.38} fill="none" stroke={COLORS.blueprint} strokeOpacity={0.5} strokeWidth={2} />
        <circle cx={360} cy={520} r={120} fill="#3f6fd8" />
        <ellipse cx={360} cy={490} rx={120} ry={16} fill="#5a8bf0" opacity={0.6} />
        <ellipse cx={360} cy={555} rx={112} ry={12} fill="#2f58b8" opacity={0.6} />
        <circle cx={400} cy={520} r={124} fill="#000" opacity={0.22} />
        <g>
          <circle cx={360 + orbitR * Math.cos(a)} cy={520 + orbitR * 0.38 * Math.sin(a)} r={20} fill="#e9d8d3" />
          <text x={360 + orbitR * Math.cos(a)} y={520 + orbitR * 0.38 * Math.sin(a) - 30} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={24} fill={COLORS.yellow}>
            ไทรทัน
          </text>
        </g>
        <text x={360} y={300} textAnchor="middle" fontFamily={FONTS.caps} fontWeight={800} fontSize={20} letterSpacing={3} fill={COLORS.blueprint}>
          NEPTUNE · RETROGRADE MOON
        </text>
      </svg>
    </AbsoluteFill>
  );
}

export function EndCardScene({ title, summary }: { title: string; summary: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const s2 = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: NAVY_BG, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <Img src={staticFile("brand/logo.svg")} style={{ width: 140, height: 140, transform: `scale(${s})` }} />
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.cream, textAlign: "center", padding: "0 30px", whiteSpace: "nowrap", transform: `scale(${s})` }}>{title}</div>
      <div style={{ opacity: s2, background: COLORS.red, color: COLORS.white, fontFamily: FONTS.display, fontWeight: 700, fontSize: 34, padding: "8px 26px", borderRadius: 12 }}>{summary}</div>
      <div style={{ opacity: s2, fontFamily: FONTS.caps, fontWeight: 600, fontSize: 22, letterSpacing: 2, color: COLORS.blueprint }}>{brand.endCardHandle}</div>
    </AbsoluteFill>
  );
}
