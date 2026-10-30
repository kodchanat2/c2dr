import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { HudSpec } from "@lib/components/ui/HudCard";
import { LivingRoomScene } from "@lib/components/sets/LivingRoom";
import { BoxOfCats, Box, CatMapScene, CushionBlueprint, DoorstepScene, PowerCityScene, VerdictScene } from "@lib/components/sets/CatSets";
import { WastelandScene } from "@lib/components/sets/Wasteland";
import { CelSmoke } from "@lib/components/toon/CelSmoke";
import { Chip, CountCard, MeterCard, TimePill } from "@lib/components/ui/Cards";
import { COLORS, FONTS } from "@lib/theme";
import { Cat } from "@lib/components/character/Cat";

export type SfxName = "whoosh" | "glitch" | "stamp" | "drone" | "tick" | "rev" | "draw" | "pop" | "thump" | "shimmer" | "boom" | "water" | "scratch" | "alarm" | "creak" | "snap" | "rumble" | "chord" | "sting";

export interface Cut {
  at: number;
  scene: () => ReactNode;
  hud?: HudSpec[];
  sfx?: SfxName;
}

const WaveIcon = <path d="M 4 22 Q 10 6 16 22 T 28 22 T 40 22" stroke={COLORS.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
const BoltIcon = <path d="M 24 4 L 10 24 L 20 24 L 16 40 L 34 16 L 24 16 Z" fill={COLORS.red} />;

function Stamp({ text, at = 10 }: { text: string; at?: number }) {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [at, at + 6], [2.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(frame, [at, at + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${s}) rotate(-8deg)`, border: `6px solid ${COLORS.red}`, color: COLORS.red, borderRadius: 16, padding: "4px 28px", fontFamily: FONTS.display, fontWeight: 800, fontSize: 64, background: "rgba(20,26,46,0.6)" }}>{text}</div>
    </div>
  );
}

function CoalPlantScene() {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 40], [1, 0.05], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <WastelandScene variant="dusk" />
      <svg width={720} height={1280} style={{ position: "absolute" }}>
        {[180, 330, 480].map((x) => <path key={x} d={`M ${x - 40} 1000 L ${x - 25} 640 L ${x + 25} 640 L ${x + 40} 1000 Z`} fill="#3a3540" />)}
      </svg>
      <div style={{ opacity: fade }}>
        <CelSmoke columns={[-1.45, -0.25, 0.95].map((x) => ({ x, base: 0.1, height: 5, width: 0.7, color: "#4a4650" }))} />
      </div>
      <Stamp text="ปิดถาวร" at={16} />
    </AbsoluteFill>
  );
}

function IdeaOverlay() {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [6, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <g transform={`translate(250 470) scale(${pop})`}>
        <ellipse cx={0} cy={0} rx={130} ry={90} fill="#fff" />
        <path d="M -30 80 L -60 130 L 10 86 Z" fill="#fff" />
        <Cat pose="sit" coat="orange" x={-45} y={60} scale={0.4} />
        <path d="M 40 -40 L 20 0 L 42 0 L 24 50" stroke={COLORS.yellow} strokeWidth={10} fill="none" strokeLinejoin="round" />
        <text x={56} y={30} fontFamily={FONTS.display} fontWeight={800} fontSize={70} fill={COLORS.red}>?</text>
      </g>
    </svg>
  );
}

// Cats sit on the floor in front of the sofa so their faces stay below the subtitle band (y ≈ 794)
const ORANGE_SOFA = { pose: "sit" as const, coat: "orange" as const, x: 490, y: 1110, scale: 1.05 };
const BEAT_SOFA = { ...ORANGE_SOFA, pose: "beatbox" as const };

export const STORYBOARD: Record<string, Cut[]> = {
  "01": [{ at: 0, sfx: "tick", scene: () => <LivingRoomScene cats={[ORANGE_SOFA]} /> }],
  "02": [
    { at: 0, sfx: "boom", scene: () => <LivingRoomScene cats={[BEAT_SOFA]} camera="close" shake={0.6} /> },
    { at: 0.5, sfx: "thump", scene: () => <LivingRoomScene cats={[BEAT_SOFA]} shake={1} /> },
  ],
  "03": [{ at: 0, sfx: "pop", scene: () => (<><CatMapScene /><CountCard th="แมวทั่วโลก" en="world cats" from={0} to={600000000} unit="ตัว" top={110} source="est. global domestic cat population" /></>) }],
  "04": [{ at: 0, sfx: "rumble", scene: () => (<><LivingRoomScene cats={[BEAT_SOFA]} camera="table" /><MeterCard th="ความสั่นสะเทือน" en="vibration" from={0} to={92} icon={WaveIcon} top={110} /></>) }],
  "05": [{ at: 0, sfx: "shimmer", scene: () => (<LivingRoomScene cats={[{ ...ORANGE_SOFA, x: 560 }]} person={{ pose: "point", expression: "wow", x: 230 }}><IdeaOverlay /></LivingRoomScene>) }],
  "06": [{ at: 0, sfx: "draw", scene: () => <CushionBlueprint /> }],
  "07": [{ at: 0, sfx: "rev", scene: () => (<><LivingRoomScene cats={[BEAT_SOFA]} cushion /><CountCard th="ชาร์จมือถือได้" en="phones per hour" from={0} to={3} unit="เครื่อง/ชม." top={110} /></>) }],
  "08": [{ at: 0, sfx: "chord", scene: () => <PowerCityScene catWindows /> }],
  "09": [{ at: 0, sfx: "stamp", scene: () => (<><PowerCityScene catWindows /><CountCard th="ค่าไฟ" en="electricity bill" from={0} to={-90} suffix="%" red top={110} /></>) }],
  "10": [{ at: 0, sfx: "stamp", scene: () => <CoalPlantScene /> }],
  "11": [
    {
      at: 0,
      sfx: "whoosh",
      scene: () => (
        <>
          <LivingRoomScene cats={[{ ...BEAT_SOFA, x: 540 }]} cushion person={{ pose: "point", expression: "smile", x: 200, headphones: true }} />
          <Chip th="อาชีพมาแรง" en="top job 2030" style={{ position: "absolute", top: 110, left: 36, transform: "scale(1.5)", transformOrigin: "left top" }} />
        </>
      ),
    },
  ],
  "12": [
    { at: 0, sfx: "boom", scene: () => (<><CatMapScene focusThailand /><CountCard th="อันดับโลก" en="world rank · power" from={9} to={1} prefix="#" top={110} delay={20} /></>) },
    { at: 0.55, sfx: "thump", scene: () => <LivingRoomScene cats={[{ ...BEAT_SOFA, scale: 1.25 }]} shake={1} camera="close" /> },
  ],
  "13": [{ at: 0, sfx: "pop", scene: () => (<><LivingRoomScene cats={[ORANGE_SOFA]} cushion /><CountCard th="ค่าตอบแทน" en="salary · lickable treats" from={0} to={3} unit="ซอง/วัน" top={110} /></>) }],
  "14": [{ at: 0, sfx: "drone", scene: () => <DoorstepScene /> }],
  "15": [
    {
      at: 0,
      sfx: "creak",
      scene: () => (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #4a3a30, #1f1813 75%)" }}>
          <svg width={720} height={1280}>
            <Box x={360} y={1000} scale={1.4} />
          </svg>
        </AbsoluteFill>
      ),
    },
  ],
  "16": [{ at: 0, sfx: "scratch", scene: () => <LivingRoomScene cats={[{ ...ORANGE_SOFA, pose: "stare" }]} camera="close" /> }],
  "17": [
    { at: 0, sfx: "pop", scene: () => <BoxOfCats count={1} coats={["orange", "grey", "black"]} hopIndex={1} /> },
    { at: 0.5, sfx: "pop", scene: () => <BoxOfCats count={2} coats={["orange", "grey", "black"]} hopIndex={2} /> },
  ],
  "18": [{ at: 0, sfx: "boom", scene: () => (<><PowerCityScene sweep /><MeterCard th="โครงข่ายไฟฟ้า" en="power grid" from={100} to={0} icon={BoltIcon} red top={110} /></>) }],
  "19": [{ at: 0, sfx: "drone", scene: () => (<><LivingRoomScene dark candle person={{ pose: "idle", expression: "worried", x: 300 }} /><TimePill th="รอแมวตื่น…" en="waiting" /></>) }],
  "20": [
    { at: 0, sfx: "chord", scene: () => <BoxOfCats count={3} coats={["orange", "grey", "black"]} /> },
    { at: 0.55, sfx: "sting", scene: () => <VerdictScene /> },
  ],
};
