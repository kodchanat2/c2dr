import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { seeded } from "../style/StyleKit";
import { Particles } from "./Wasteland";
import { CelSmoke } from "../toon/CelSmoke";
import { SkinnedHand, SKIN_POSES } from "../toon/SkinnedHand";
import { ToonLights, ToonStage } from "../toon/toon";
import brand from "@config/brand.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Atmosphere cross-section: smoke columns rise into the stratosphere and block the sun's rays. */
export function AtmosphereScene() {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 60], [0.3, 1], clamp);
  const cols = [150, 290, 430, 570];
  const sun: [number, number] = [610, 170];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0b1230, #1f3a78 60%, #4a7fc0)" }}>
      <svg width={720} height={1280}>
        <ellipse cx={360} cy={1500} rx={900} ry={560} fill="#3f7a3a" />
        {[[380, "สตราโตสเฟียร์", "STRATOSPHERE · 12–50 KM"], [760, "โทรโพสเฟียร์", "TROPOSPHERE · 0–12 KM"]].map(([y, th, en]) => (
          <g key={y as number}>
            <line x1={0} y1={y as number} x2={720} y2={y as number} stroke="#cfe0ff" strokeOpacity={0.5} strokeDasharray="8 8" />
            <text x={24} y={(y as number) - 12} fontFamily={FONTS.display} fontWeight={700} fontSize={20} fill="#fff">{th}</text>
            <text x={24} y={(y as number) + 18} fontFamily={FONTS.caps} fontWeight={600} fontSize={10} letterSpacing={1.4} fill="#cfe0ff">{en}</text>
          </g>
        ))}
        <circle cx={sun[0]} cy={sun[1]} r={40} fill={COLORS.sun} style={{ filter: "drop-shadow(0 0 24px #ffd36b)" }} />
        {cols.map((x, i) => {
          const topY = 1060 - 700 * rise;
          return (
            <g key={x}>
              <line x1={sun[0]} y1={sun[1]} x2={x + 10} y2={topY} stroke="#ffe7a0" strokeWidth={2} opacity={0.75} />
              <ellipse cx={x} cy={1060} rx={36} ry={12} fill="#ff6a1a" style={{ filter: "blur(6px)" }} opacity={0.6 + 0.3 * Math.sin(frame / 4 + i)} />
            </g>
          );
        })}
      </svg>
      <CelSmoke blur={2} sun="#ffe7a0" columns={cols.map((x) => ({ x: (x - 360) / 125, base: -3.4, height: 3 + 5.6 * rise, width: 0.75, color: "#2a2a30", glow: "#5a2a12" }))} />
    </AbsoluteFill>
  );
}

/** Top-down: a hand reaches into an almost empty rice bowl while banknotes fall. */
export function RiceBowlScene() {
  const frame = useCurrentFrame();
  const r = seeded(9);
  const notes = Array.from({ length: 9 }, () => ({ x: r() * 720, y0: r() * -600, rot: r() * 360, c: ["#7a6bb0", "#4f9a74", "#c46b7a"][Math.floor(r() * 3)] }));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #5a4230, #2a1d14 75%)" }}>
      <svg width={720} height={1280}>
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={0} y1={i * 100} x2={720} y2={i * 100 + 30} stroke="#000" strokeOpacity={0.12} strokeWidth={3} />)}
        {notes.map((n, i) => (
          <rect key={i} x={n.x} y={n.y0 + frame * 9} width={110} height={56} rx={4} fill={n.c} opacity={0.85} transform={`rotate(${n.rot + frame * 3} ${n.x + 55} ${n.y0 + frame * 9 + 28})`} style={{ filter: "blur(1.5px)" }} />
        ))}
        <ellipse cx={360} cy={760} rx={210} ry={160} fill="#9aa0ad" />
        <ellipse cx={360} cy={750} rx={185} ry={136} fill="#c9ccd2" />
        <ellipse cx={360} cy={770} rx={130} ry={88} fill="#6b707c" />
        {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={330 + (i % 5) * 14} cy={780 + Math.floor(i / 5) * 9} rx={4} ry={2} fill="#fbf7ee" />)}
      </svg>
      <ToonStage camera={[0, 0, 13]} fov={34}>
        <ToonLights rimIntensity={1.2} />
        <SkinnedHand side="right" pose={SKIN_POSES.reach} position={[-0.15, interpolate(frame, [0, 30], [6, 0.2], clamp), 0.5]} rotation={[0.45, Math.PI, Math.PI]} scale={1.5} sleeve="#3a3530" forearm={4} />
      </ToonStage>
    </AbsoluteFill>
  );
}

/** A dim, frozen Earth seen from space. */
export function DarkPlanetScene() {
  return (
    <AbsoluteFill style={{ background: "#07080b" }}>
      <svg width={720} height={1280}>
        <defs>
          <radialGradient id="dark-planet" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#4a5058" />
            <stop offset="70%" stopColor="#1c1f25" />
            <stop offset="100%" stopColor="#0b0c10" />
          </radialGradient>
        </defs>
        <circle cx={360} cy={620} r={250} fill="url(#dark-planet)" />
      </svg>
      <Particles count={50} color="#cfd2d8" speed={0.6} seed={21} size={1.8} />
    </AbsoluteFill>
  );
}

export function SeriesEndCard({ title, episode, question }: { title: string; episode: string; question: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const s2 = spring({ frame: frame - 12, fps, config: { damping: 14 } });
  const [lead, rest] = [title.slice(0, 3), title.slice(3)];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1c1f25, #07080b 70%)", alignItems: "center" }}>
      <svg width={720} height={1280} style={{ position: "absolute" }}>
        <circle cx={360} cy={760} r={190} fill="#1c1f25" />
      </svg>
      <div style={{ marginTop: 240, opacity: s, fontFamily: FONTS.caps, fontWeight: 600, fontSize: 14, letterSpacing: 2, color: COLORS.cream }}>• ซีรีส์ · SERIES</div>
      <div style={{ transform: `scale(${s})`, fontFamily: FONTS.display, fontWeight: 800, fontSize: 70, color: COLORS.cream }}>
        {lead}
        <span style={{ color: COLORS.red }}>{rest}</span>
      </div>
      <div style={{ transform: `scale(${s})`, background: COLORS.red, color: "#fff", fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, padding: "4px 22px 8px", borderRadius: 8 }}>{episode}</div>
      <div style={{ position: "absolute", top: 1000, opacity: s2, fontFamily: FONTS.display, fontWeight: 700, fontSize: 32, color: COLORS.yellow }}>{question}</div>
      <div style={{ position: "absolute", top: 1080, display: "flex", gap: 16, opacity: s2 }}>
        {["หลบใต้ดิน", "หนีไปเกาะ"].map((t) => (
          <div key={t} style={{ border: `2px solid ${COLORS.cream}`, color: COLORS.cream, borderRadius: 999, padding: "6px 20px", fontFamily: FONTS.body, fontWeight: 700, fontSize: 20 }}>{t}</div>
        ))}
      </div>
      <Img src={staticFile("brand/logo.svg")} style={{ position: "absolute", top: 1160, width: 56, height: 56, opacity: s2 }} />
      <div style={{ position: "absolute", top: 1222, opacity: s2, fontFamily: FONTS.caps, fontSize: 14, letterSpacing: 2, color: COLORS.blueprint }}>{brand.endCardHandle}</div>
    </AbsoluteFill>
  );
}
