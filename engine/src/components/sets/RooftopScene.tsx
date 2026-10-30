import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../theme";
import { Person, type Expression, type Pose } from "../character/Person";
import { DepthLayer, Graded } from "../style/StyleKit";
import { CityLayer, ForegroundLeaves, RoofFloor, RooftopProps } from "./city";
import { MoonDisc, SunDisc } from "./celestial";

type Range = [number, number];

export interface RooftopSceneProps {
  hours: Range; // clock time animates across the shot, drives sky colour
  moon?: { t: Range; phase: Range; r?: number };
  sun?: { t: Range };
  pose?: Pose;
  expression?: Expression;
  rim?: number;
  eclipse?: boolean;
  speedLines?: boolean;
  wobble?: boolean;
  starTwinkle?: boolean;
}

const HOUR_KEYS = [0, 6, 9, 12, 15, 18, 21, 24];
const SKY_TOP = ["#070b1f", "#2a3b6b", "#4f93d1", "#3f8fd6", "#4c97d4", "#33407a", "#0c1233", "#070b1f"];
const SKY_BOTTOM = ["#18214a", "#f0a36b", "#bcdcf2", "#b0d8f5", "#cfe5f2", "#f39a6b", "#25306a", "#18214a"];
const HORIZON_Y = 760;
const DEFAULT_EXPRESSION: Record<Pose, Expression> = { idle: "neutral", lookUp: "wow", point: "smile", yawn: "yawn", sit: "smile", shades: "neutral" };

// Sky arc: t = 0 east horizon (left), 0.5 zenith, 1 west horizon (right)
export const arcPoint = (t: number): [number, number] => [60 + 600 * t, HORIZON_Y - 560 * Math.sin(Math.PI * t)];

const nightness = (h: number) => interpolate(h % 24, [0, 5, 8, 17, 20, 24], [1, 1, 0, 0, 1, 1]);

function Clouds({ night }: { night: number }) {
  const frame = useCurrentFrame();
  const drift = frame * 0.3;
  return (
    <svg width={720} height={1280} style={{ position: "absolute", filter: "blur(6px)", opacity: 0.55 * (1 - night * 0.7) }}>
      {[[80, 250, 1.2], [420, 180, 0.9], [600, 380, 1.4], [250, 470, 0.8]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${((x + drift) % 900) - 90} ${y}) scale(${s})`} fill="#fff">
          <ellipse cx={0} cy={0} rx={70} ry={22} />
          <ellipse cx={-30} cy={-14} rx={36} ry={22} />
          <ellipse cx={26} cy={-18} rx={42} ry={26} />
        </g>
      ))}
    </svg>
  );
}

function Sky({ night, moon, sun, eclipseDim, speedLines, starTwinkle, p }: { night: number; moon?: RooftopSceneProps["moon"]; sun?: RooftopSceneProps["sun"]; eclipseDim: number; speedLines?: boolean; starTwinkle?: boolean; p: number }) {
  const frame = useCurrentFrame();
  const lerp = (r: Range) => r[0] + (r[1] - r[0]) * p;
  const moonPos = moon ? arcPoint(lerp(moon.t)) : undefined;
  const sunPos = sun ? arcPoint(lerp(sun.t)) : undefined;
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 720} cy={(i * 53) % 720} r={i % 4 === 0 ? 2 : 1.1} fill="#fff" opacity={night * (starTwinkle && i === 7 ? 0.5 + 0.5 * Math.sin(frame / 4) : 0.65)} />
      ))}
      {sunPos && <SunDisc cx={sunPos[0]} cy={sunPos[1]} r={38} intensity={1 - eclipseDim} />}
      {eclipseDim > 0 && sunPos && <circle cx={sunPos[0]} cy={sunPos[1]} r={50} fill="none" stroke="#fff6d8" strokeWidth={7} opacity={eclipseDim} style={{ filter: "blur(5px)" }} />}
      {moonPos && moon && (
        <g>
          {speedLines &&
            [0, 1, 2].map((i) => <line key={i} x1={moonPos[0] - 40 - i * 10} y1={moonPos[1] - 14 + i * 14} x2={moonPos[0] - 140 - i * 20} y2={moonPos[1] - 4 + i * 14} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />)}
          <MoonDisc cx={moonPos[0]} cy={moonPos[1]} r={moon.r ?? 42} phase={lerp(moon.phase)} glow={night * 22} shade={0.12 + 0.73 * night} />
        </g>
      )}
    </svg>
  );
}

export function RooftopScene(props: RooftopSceneProps) {
  const { hours, moon, sun, pose = "idle", expression, rim = 0, eclipse, speedLines, wobble, starTwinkle } = props;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1]);
  const hour = hours[0] + (hours[1] - hours[0]) * p;
  const eclipseDim = eclipse ? interpolate(frame, [8, 30], [0, 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const top = interpolateColors(hour, HOUR_KEYS, SKY_TOP);
  const bottom = interpolateColors(hour, HOUR_KEYS, SKY_BOTTOM);
  const night = Math.max(nightness(hour), eclipseDim);
  const day = 1 - night;
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const skew = wobble ? Math.sin(frame / 3) * 2.5 : 0;
  const farFill = interpolateColors(night, [0, 1], ["#8fa6c4", "#1d2547"]);
  const midFill = interpolateColors(night, [0, 1], ["#5f7391", "#171d3a"]);

  return (
    <Graded>
      <AbsoluteFill style={{ background: `linear-gradient(${top}, ${bottom})` }}>
        <AbsoluteFill style={{ transform: `scale(${zoom}) skewX(${skew}deg)`, transformOrigin: "50% 80%" }}>
          <Clouds night={night} />
          <Sky night={night} moon={moon} sun={sun} eclipseDim={eclipseDim} speedLines={speedLines} starTwinkle={starTwinkle} p={p} />
          <DepthLayer blur={9} parallax={10} tint={bottom} tintOpacity={0.35 * day}>
            <CityLayer seed={11} base={900} count={22} topRange={[520, 700]} widthRange={[50, 95]} fill={farFill} shade="rgba(0,0,0,0.12)" lights={night} windowColor="#ffd98a" />
          </DepthLayer>
          <DepthLayer blur={5} parallax={22}>
            <CityLayer seed={29} base={980} count={12} topRange={[640, 820]} widthRange={[80, 140]} fill={midFill} shade="rgba(0,0,0,0.18)" lights={night} windowColor={COLORS.yellow} />
          </DepthLayer>
          <DepthLayer blur={2.5} parallax={34}>
            <RooftopProps dayLight={day} />
          </DepthLayer>
          <RoofFloor dayLight={day} />
          <AbsoluteFill style={{ background: "#000", opacity: eclipseDim * 0.35 }} />
          <svg width={720} height={1280} style={{ position: "absolute" }}>
            <Person pose={pose} expression={expression ?? DEFAULT_EXPRESSION[pose]} x={470} y={pose === "sit" ? 1060 : 1150} scale={1.55} rim={rim} />
          </svg>
          <DepthLayer blur={14} parallax={70}>
            <ForegroundLeaves />
          </DepthLayer>
        </AbsoluteFill>
      </AbsoluteFill>
    </Graded>
  );
}
