import { useCurrentFrame } from "remotion";

export type Pose = "idle" | "lookUp" | "point" | "yawn" | "sit" | "shades";
export type Expression = "neutral" | "wow" | "smile" | "yawn" | "worried";

interface PersonProps {
  pose: Pose;
  x: number;
  y: number; // feet baseline (or seat for "sit")
  scale?: number;
  expression?: Expression;
  rim?: number; // cool rim light from the moon, 0..1
  facing?: 1 | -1;
}

// Joint angles in degrees. Shoulder 0 = arm hanging; positive swings the arm forward (toward the viewer's right when facing = 1)
interface Rig {
  head: number;
  torso: number;
  armBack: [number, number];
  armFront: [number, number];
}

const RIGS: Record<Pose, Rig> = {
  idle: { head: 0, torso: 0, armBack: [6, -8], armFront: [-6, -10] },
  lookUp: { head: -24, torso: -3, armBack: [10, -12], armFront: [-12, -16] },
  point: { head: -28, torso: -4, armBack: [8, -10], armFront: [-158, -8] },
  yawn: { head: -12, torso: -2, armBack: [168, 25], armFront: [-168, -25] },
  sit: { head: -16, torso: 4, armBack: [30, -50], armFront: [-24, -60] },
  shades: { head: -20, torso: -2, armBack: [8, -10], armFront: [-128, -100] },
};

const SKIN = "#c48a60";
const SKIN_SHADE = "#9d6743";
const SHIRT = "#f2b632";
const SHIRT_SHADE = "#c98d1c";
const JEANS = "#33456b";
const JEANS_SHADE = "#25324f";
const HAIR = "#1c1714";
const HAIR_LIGHT = "#3a2f28";
const SANDAL = "#5b3a2a";

function Arm({ sx, sy, rig, shade }: { sx: number; sy: number; rig: [number, number]; shade?: boolean }) {
  const upper = 62;
  const fore = 58;
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${rig[0]})`}>
      {/* sleeve */}
      <path d="M -13 -6 Q 0 -12 13 -6 L 11 30 L -11 30 Z" fill={shade ? SHIRT_SHADE : SHIRT} />
      <path d={`M -7 28 L -6 ${upper} L 6 ${upper} L 7 28 Z`} fill={shade ? SKIN_SHADE : SKIN} />
      <g transform={`translate(0 ${upper}) rotate(${rig[1]})`}>
        <path d={`M -6 0 L -5 ${fore} L 5 ${fore} L 6 0 Z`} fill={shade ? SKIN_SHADE : SKIN} />
        {/* hand: palm + thumb + finger hint */}
        <g transform={`translate(0 ${fore})`}>
          <ellipse cx={0} cy={9} rx={8.5} ry={11} fill={shade ? SKIN_SHADE : SKIN} />
          <ellipse cx={7} cy={4} rx={3.5} ry={7} transform="rotate(-25 7 4)" fill={shade ? SKIN_SHADE : SKIN} />
          <path d="M -4 14 L -4 19 M 0 15 L 0 20 M 4 14 L 4 19" stroke={SKIN_SHADE} strokeWidth={1.4} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Face({ expression, blink }: { expression: Expression; blink: number }) {
  const browY = expression === "worried" ? -56 : expression === "wow" ? -60 : -57;
  const browTilt = expression === "worried" ? 8 : 0;
  return (
    <g>
      {/* eyes */}
      {[-13, 13].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-46} rx={6.5} ry={(expression === "wow" ? 7.5 : 5.5) * blink} fill="#fbf7f0" />
          <circle cx={ex + 1.5} cy={-46} r={3.6 * Math.min(1, blink * 1.4)} fill="#2a1d16" />
          <circle cx={ex + 2.6} cy={-47.4} r={1.1 * blink} fill="#fff" />
          <path d={`M ${ex - 8} ${browY + (ex < 0 ? browTilt : -browTilt) * 0.5} L ${ex + 8} ${browY - (ex < 0 ? browTilt : -browTilt) * 0.5}`} stroke={HAIR} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      {/* nose */}
      <path d="M 1 -42 Q 6 -34 1 -31" fill="none" stroke={SKIN_SHADE} strokeWidth={2.4} strokeLinecap="round" />
      {/* mouth */}
      {expression === "yawn" && <ellipse cx={1} cy={-20} rx={8} ry={10} fill="#5a2622" />}
      {expression === "wow" && <ellipse cx={1} cy={-21} rx={5.5} ry={6.5} fill="#5a2622" />}
      {expression === "smile" && <path d="M -9 -24 Q 1 -14 11 -24 Z" fill="#fff" stroke="#5a2622" strokeWidth={2.4} strokeLinejoin="round" />}
      {(expression === "neutral" || expression === "worried") && (
        <path d={expression === "worried" ? "M -6 -20 Q 1 -25 8 -20" : "M -7 -23 Q 1 -19 9 -23"} fill="none" stroke="#5a2622" strokeWidth={2.6} strokeLinecap="round" />
      )}
      {/* cheek blush */}
      <ellipse cx={-20} cy={-32} rx={6} ry={3.5} fill="#d9735a" opacity={0.25} />
      <ellipse cx={22} cy={-32} rx={6} ry={3.5} fill="#d9735a" opacity={0.25} />
    </g>
  );
}

function Head({ angle, expression, blink, shades }: { angle: number; expression: Expression; blink: number; shades: boolean }) {
  return (
    <g transform={`translate(0 -176) rotate(${angle})`}>
      <path d="M -9 -8 L -8 10 L 9 10 L 10 -8 Z" fill={SKIN_SHADE} />
      {/* ears */}
      <ellipse cx={-31} cy={-40} rx={6} ry={9} fill={SKIN_SHADE} />
      <ellipse cx={32} cy={-40} rx={6} ry={9} fill={SKIN} />
      {/* skull + jaw, shaded on the far side */}
      <path d="M -31 -50 Q -32 -86 1 -88 Q 33 -86 32 -50 Q 32 -18 14 -8 Q 1 -2 -13 -8 Q -31 -18 -31 -50 Z" fill={SKIN} />
      <path d="M -31 -50 Q -32 -18 -13 -8 Q -4 -5 2 -4 Q -18 -20 -20 -52 Z" fill={SKIN_SHADE} opacity={0.55} />
      <Face expression={expression} blink={blink} />
      {/* hair: volume + side part + highlight */}
      <path d="M -35 -48 Q -42 -96 2 -100 Q 44 -98 37 -50 Q 33 -70 22 -72 Q 6 -62 -14 -74 Q -26 -66 -35 -48 Z" fill={HAIR} />
      <path d="M -6 -94 Q 14 -97 26 -86" fill="none" stroke={HAIR_LIGHT} strokeWidth={5} strokeLinecap="round" />
      {shades && (
        <g>
          <rect x={-27} y={-54} width={24} height={15} rx={6} fill="#0d0d10" />
          <rect x={3} y={-54} width={24} height={15} rx={6} fill="#0d0d10" />
          <path d="M -3 -48 L 3 -48" stroke="#0d0d10" strokeWidth={3} />
          <path d="M -23 -51 L -14 -51" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
        </g>
      )}
    </g>
  );
}

function Legs({ sitting }: { sitting: boolean }) {
  if (sitting) {
    return (
      <g>
        <path d="M -26 -6 L 74 -12 L 76 14 L -24 18 Z" fill={JEANS} />
        <path d="M 58 -10 L 80 -10 L 84 86 L 62 86 Z" fill={JEANS_SHADE} />
        <ellipse cx={80} cy={90} rx={20} ry={7} fill={SANDAL} />
      </g>
    );
  }
  return (
    <g>
      <path d="M -24 -4 L -4 -4 L -6 110 L -22 110 Z" fill={JEANS_SHADE} />
      <path d="M 2 -4 L 24 -4 L 22 110 L 6 110 Z" fill={JEANS} />
      <path d="M -10 30 Q -14 50 -12 70" stroke={JEANS} strokeWidth={2} fill="none" opacity={0.6} />
      <ellipse cx={-14} cy={113} rx={17} ry={6} fill={SANDAL} />
      <ellipse cx={15} cy={113} rx={17} ry={6} fill={SANDAL} />
    </g>
  );
}

export function Person({ pose, x, y, scale = 1, expression = "neutral", rim = 0, facing = 1 }: PersonProps) {
  const frame = useCurrentFrame();
  const rig = RIGS[pose];
  const breathe = Math.sin(frame / 10) * 1.2;
  const sway = Math.sin(frame / 16) * 1.6;
  const blink = frame % 96 > 91 ? 0.12 : 1;
  const sitting = pose === "sit";
  const legOffset = sitting ? 0 : -110;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}
      style={{ filter: rim ? `drop-shadow(0 0 ${6 * rim}px rgba(190,210,255,${0.9 * rim}))` : undefined }}
    >
      <ellipse cx={0} cy={sitting ? 92 : 4} rx={58} ry={10} fill="#000" opacity={0.25} />
      <g transform={`translate(0 ${legOffset})`}>
        <Legs sitting={sitting} />
        <g transform={`translate(0 ${breathe}) rotate(${rig.torso + sway * 0.25})`}>
          <Arm sx={-24} sy={-150} rig={[rig.armBack[0] + sway, rig.armBack[1]]} shade />
          {/* torso: t-shirt with collar, fold shadows and a belt line */}
          <path d="M -30 -160 Q 0 -170 32 -160 L 30 -60 Q 30 -6 24 -2 L -24 -2 Q -30 -6 -30 -60 Z" fill={SHIRT} />
          <path d="M -30 -160 Q -36 -90 -24 -2 L -12 -2 Q -20 -80 -16 -158 Z" fill={SHIRT_SHADE} opacity={0.7} />
          <path d="M -12 -163 Q 1 -146 14 -163" fill="none" stroke={SHIRT_SHADE} strokeWidth={5} strokeLinecap="round" />
          <path d="M 8 -120 Q 14 -90 10 -60" stroke={SHIRT_SHADE} strokeWidth={2.5} fill="none" opacity={0.6} />
          <rect x={-26} y={-8} width={52} height={8} rx={3} fill="#3b2a20" />
          <Head angle={rig.head} expression={expression} blink={blink} shades={pose === "shades"} />
          <Arm sx={26} sy={-150} rig={[rig.armFront[0] - sway, rig.armFront[1]]} />
        </g>
      </g>
    </g>
  );
}
