// Condo living room: blurred window + city, sofa, coffee table with a cup that hops on the beat.
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cat, useBeat, type CatCoat, type CatPose } from "../character/Cat";
import { Person, type Expression, type Pose } from "../character/Person";
import { DepthLayer, Graded } from "../style/StyleKit";
import { CityLayer } from "./city";

export interface CatPlacement {
  pose: CatPose;
  coat?: CatCoat;
  x: number;
  y: number;
  scale?: number;
  phase?: number;
}

interface LivingRoomProps {
  cats?: CatPlacement[];
  camera?: "wide" | "close" | "table";
  dark?: boolean; // blackout: only candle light
  cushion?: boolean; // the cat sits on the glowing power cushion
  person?: { pose: Pose; expression?: Expression; x: number; headphones?: boolean };
  candle?: boolean;
  shake?: number; // 0..1 room shake on the beat
  children?: ReactNode;
}

// translate is in pre-scale px; `table` brings the coffee cup to the centre of the frame
const CAMERA = {
  wide: { scale: 1, origin: "50% 70%", dx: 0, dy: 0 },
  close: { scale: 1.75, origin: "50% 62%", dx: 0, dy: 0 },
  table: { scale: 1.9, origin: "22% 82%", dx: 105, dy: -30 },
} as const;

function Window({ dark }: { dark: boolean }) {
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <rect x={90} y={150} width={540} height={520} rx={8} fill={dark ? "#0b0f22" : "#1b2550"} />
      <rect x={90} y={150} width={540} height={520} rx={8} fill="none" stroke="#e9dcc6" strokeWidth={16} />
      <line x1={360} y1={150} x2={360} y2={670} stroke="#e9dcc6" strokeWidth={10} />
    </svg>
  );
}

function CoffeeTable({ hop }: { hop: number }) {
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <rect x={40} y={1090} width={330} height={26} rx={8} fill="#8a5a3c" />
      <rect x={60} y={1116} width={18} height={140} fill="#6e452d" />
      <rect x={330} y={1116} width={18} height={140} fill="#6e452d" />
      <g transform={`translate(160 ${1088 - hop * 18}) rotate(${hop * 8})`}>
        <path d="M -30 0 L -26 -60 L 26 -60 L 30 0 Z" fill="#f4efe7" />
        <path d="M 26 -48 Q 50 -40 26 -18" stroke="#f4efe7" strokeWidth={8} fill="none" />
        <ellipse cx={0} cy={-58} rx={25} ry={6} fill="#5a3522" />
        <ellipse cx={0} cy={-58} rx={25 * hop} ry={6 * hop} fill="none" stroke="#c9a283" strokeWidth={2} />
      </g>
      {hop > 0.5 && <path d="M 110 1080 l -14 -10 M 210 1080 l 14 -10" stroke="#fff" strokeWidth={4} strokeLinecap="round" />}
    </svg>
  );
}

function Cushion({ glow }: { glow: number }) {
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <ellipse cx={490} cy={1110} rx={170} ry={36} fill="#3a7bd5" />
      <ellipse cx={490} cy={1100} rx={160} ry={28} fill="#5a9bf0" />
      <ellipse cx={490} cy={1100} rx={180} ry={44} fill="none" stroke="#9fe0ff" strokeWidth={5} opacity={glow} style={{ filter: "blur(2px)" }} />
      <path d="M 660 1115 Q 700 1160 720 1150" stroke="#222" strokeWidth={6} fill="none" />
    </svg>
  );
}

export function LivingRoomScene({ cats = [], camera = "wide", dark = false, cushion, person, candle, shake = 0, children }: LivingRoomProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = useBeat();
  const anyBeatbox = cats.some((c) => c.pose === "beatbox");
  const hop = anyBeatbox ? beat : 0;
  const cam = CAMERA[camera];
  const zoom = cam.scale * interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const jitter = shake * beat * 6;
  return (
    <Graded>
      <AbsoluteFill style={{ background: dark ? "#0d0c12" : "linear-gradient(#e9d3b4, #d8bc97)" }}>
        <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${cam.dx + jitter}px, ${cam.dy - jitter}px)`, transformOrigin: cam.origin }}>
          <DepthLayer blur={10}>
            <Window dark={dark} />
            {!dark && (
              <svg width={720} height={1280} style={{ position: "absolute" }}>
                <defs>
                  <clipPath id="win">
                    <rect x={98} y={158} width={524} height={504} />
                  </clipPath>
                </defs>
                <g clipPath="url(#win)">
                  <CityLayer seed={63} base={680} count={14} topRange={[330, 520]} widthRange={[50, 90]} fill="#2b3566" shade="rgba(0,0,0,0.2)" lights={0.9} windowColor="#ffd98a" />
                </g>
              </svg>
            )}
          </DepthLayer>
          <DepthLayer blur={3}>
            <svg width={720} height={1280} style={{ position: "absolute" }}>
              <rect x={0} y={900} width={720} height={380} fill={dark ? "#15131a" : "#9a6b4a"} />
              {/* sofa */}
              <rect x={250} y={760} width={470} height={150} rx={30} fill={dark ? "#1b1a24" : "#4f6b8a"} />
              <rect x={230} y={860} width={500} height={110} rx={26} fill={dark ? "#211f2b" : "#5d7da0"} />
            </svg>
          </DepthLayer>
          {cushion && <Cushion glow={anyBeatbox ? beat : 0.2} />}
          {person && (
            <svg width={720} height={1280} style={{ position: "absolute" }}>
              <Person pose={person.pose} expression={person.expression} x={person.x} y={1180} scale={1.35} />
              {person.headphones && <path d={`M ${person.x - 52} 760 Q ${person.x} 690 ${person.x + 52} 760`} stroke="#222" strokeWidth={12} fill="none" />}
            </svg>
          )}
          <svg width={720} height={1280} style={{ position: "absolute" }}>
            {cats.map((c, i) => (
              <Cat key={i} pose={c.pose} coat={c.coat} x={c.x} y={c.y} scale={c.scale ?? 1} phase={c.phase} />
            ))}
          </svg>
          <CoffeeTable hop={hop} />
          {candle && (
            <svg width={720} height={1280} style={{ position: "absolute" }}>
              <rect x={150} y={1030} width={22} height={60} fill="#f4efe7" />
              <ellipse cx={161} cy={1018 + Math.sin(frame / 3) * 2} rx={8} ry={16} fill="#ffcf6b" />
              <circle cx={161} cy={1020} r={260} fill="#ffb24a" opacity={0.13} style={{ filter: "blur(30px)" }} />
            </svg>
          )}
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </Graded>
  );
}
