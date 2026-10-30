import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DepthLayer, seeded } from "../style/StyleKit";
import { CityLayer } from "./city";
import { CelSmoke } from "../toon/CelSmoke";

export type WastelandVariant = "dusk" | "fireball" | "ruins" | "ruinsFire" | "snow" | "survivors";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Falling ash or snow. */
export function Particles({ count = 70, color = "#d9d4cc", speed = 1.2, seed = 5, size = 2.4 }: { count?: number; color?: string; speed?: number; seed?: number; size?: number }) {
  const frame = useCurrentFrame();
  const r = seeded(seed);
  const flakes = Array.from({ length: count }, () => ({ x: r() * 720, y: r() * 1280, s: 0.5 + r(), drift: r() * 6.28 }));
  return (
    <svg width={720} height={1280} style={{ position: "absolute", pointerEvents: "none" }}>
      {flakes.map((f, i) => (
        <circle key={i} cx={(f.x + Math.sin(frame / 20 + f.drift) * 14 + 720) % 720} cy={(f.y + frame * speed * f.s * 3) % 1280} r={size * f.s} fill={color} opacity={0.4 + 0.4 * f.s} />
      ))}
    </svg>
  );
}

/** Ruined mid-rise blocks: grid windows, missing chunks, a leaning pole and a burnt car. */
function Ruins({ tone }: { tone: string }) {
  const blocks = [[-30, 560, 260], [470, 620, 280]];
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {blocks.map(([x, top, w], i) => (
        <g key={i}>
          <path d={`M ${x} ${top + 40} L ${x + w * 0.3} ${top} L ${x + w * 0.45} ${top + 50} L ${x + w * 0.7} ${top + 10} L ${x + w} ${top + 60} L ${x + w} 1280 L ${x} 1280 Z`} fill={tone} />
          {Array.from({ length: 30 }, (_, k) => (
            <rect key={k} x={x + 20 + (k % 5) * (w / 5.4)} y={top + 90 + Math.floor(k / 5) * 64} width={w / 9} height={38} fill="#0b0c10" opacity={0.85} />
          ))}
        </g>
      ))}
      <line x1={560} y1={1100} x2={500} y2={760} stroke="#15161b" strokeWidth={10} />
      <path d="M 500 760 Q 380 740 250 790" stroke="#15161b" strokeWidth={2} fill="none" />
      <g transform="translate(470 1040)">
        <path d="M 0 60 L 30 10 L 170 0 L 230 40 L 250 80 L 0 90 Z" fill="#17181d" />
        <circle cx={50} cy={90} r={24} fill="#0b0b0e" />
        <circle cx={200} cy={90} r={24} fill="#0b0b0e" />
      </g>
    </svg>
  );
}

export function RuinsBackdrop({ dark = 0.6 }: { dark?: number }) {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#3b3a40, #1c1c22)" }}>
      <CelSmoke columns={[{ x: -1.3, base: -3, height: 9, width: 1.3 }, { x: 1.4, base: -3, height: 8, width: 1.1 }]} />
      <Ruins tone="#4a4a50" />
      <AbsoluteFill style={{ background: "#000", opacity: dark * 0.6 }} />
    </AbsoluteFill>
  );
}

const SKY: Record<WastelandVariant, string> = {
  dusk: "linear-gradient(#2b2238, #5a3a4a 55%, #2a2030)",
  fireball: "linear-gradient(#2a1b22, #6b3324 55%, #24161c)",
  ruins: "linear-gradient(#55555c, #3a3a40 60%, #26262c)",
  ruinsFire: "linear-gradient(#1c1214, #4a2016 60%, #160c0c)",
  snow: "linear-gradient(#8e939e, #c9ccd2 60%, #e8e9ec)",
  survivors: "linear-gradient(#55555c, #3a3a40 60%, #26262c)",
};

export function WastelandScene({ variant, moon }: { variant: WastelandVariant; moon?: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const intactCity = variant === "dusk" || variant === "fireball";
  const fireGrow = interpolate(frame, [0, 20], [0.6, 1], clamp);
  return (
    <AbsoluteFill style={{ background: SKY[variant], transform: `scale(${zoom})` }}>
      {moon && (
        <svg width={720} height={1280} style={{ position: "absolute" }}>
          <circle cx={430} cy={300} r={38} fill="#e9e4d8" opacity={0.85} style={{ filter: "blur(2px) drop-shadow(0 0 30px #fff)" }} />
        </svg>
      )}
      {variant === "fireball" && (
        <svg width={720} height={1280} style={{ position: "absolute" }}>
          <ellipse cx={260} cy={600} rx={260 * fireGrow} ry={170 * fireGrow} fill="#ff9a3c" opacity={0.85} style={{ filter: "blur(30px)" }} />
          <ellipse cx={260} cy={600} rx={150 * fireGrow} ry={100 * fireGrow} fill="#ffd27a" style={{ filter: "blur(10px)" }} />
        </svg>
      )}
      {intactCity ? (
        <>
          <DepthLayer blur={6}>
            <CityLayer seed={41} base={980} count={18} topRange={[520, 760]} widthRange={[60, 110]} fill="#231c2c" shade="rgba(0,0,0,0.25)" lights={variant === "dusk" ? 0.5 : 0.15} windowColor="#ffb86b" />
          </DepthLayer>
          <CityLayer seed={77} base={1100} count={9} topRange={[700, 860]} widthRange={[90, 160]} fill="#17121d" shade="rgba(0,0,0,0.3)" lights={0.2} windowColor="#ffb86b" />
        </>
      ) : variant === "snow" ? (
        <SnowField />
      ) : (
        <>
          <CelSmoke
            columns={[
              { x: -0.9, base: -2.5, height: 9, width: 1.4, color: variant === "ruinsFire" ? "#3a2a28" : "#45454d", glow: variant === "ruinsFire" ? "#6a2a10" : undefined },
              { x: 0.9, base: -2, height: 7.5, width: 1.1, color: variant === "ruinsFire" ? "#33272a" : "#3d3d45", glow: variant === "ruinsFire" ? "#6a2a10" : undefined },
            ]}
          />
          <DepthLayer blur={variant === "survivors" ? 3 : 1.5}>
            <Ruins tone={variant === "ruinsFire" ? "#3a2420" : "#55555b"} />
          </DepthLayer>
          {variant === "ruinsFire" && (
            <svg width={720} height={1280} style={{ position: "absolute", mixBlendMode: "screen" }}>
              {[[180, 1120], [600, 1180], [360, 1240]].map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y} rx={70 + Math.sin(frame / 3 + i) * 8} ry={40} fill="#ff6a1a" opacity={0.55} style={{ filter: "blur(18px)" }} />
              ))}
            </svg>
          )}
          {variant === "survivors" && <Survivors />}
        </>
      )}
      <Particles color={variant === "snow" ? "#ffffff" : variant === "ruinsFire" ? "#ffb070" : "#bdb8b0"} speed={variant === "snow" ? 1.6 : 0.8} size={variant === "snow" ? 3 : 2} />
    </AbsoluteFill>
  );
}

function SnowField() {
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <rect x={0} y={760} width={720} height={520} fill="#e4e6ea" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={360} y1={760} x2={(i - 5.5) * 260 + 360} y2={1280} stroke="#c9ccd2" strokeWidth={2} />)}
      {[820, 900, 1020, 1180].map((y) => <line key={y} x1={0} y1={y} x2={720} y2={y} stroke="#c9ccd2" strokeWidth={2} />)}
      {[[90, 560], [640, 520]].map(([x, top], i) => (
        <g key={i} style={{ filter: "blur(2px)" }}>
          <path d={`M ${x} 780 Q ${x + 10} ${top + 100} ${x - 6} ${top}`} stroke="#5a5048" strokeWidth={12} fill="none" />
          {[-1, 1].map((s) => <path key={s} d={`M ${x - 6} ${top} q ${60 * s} -20 ${110 * s} 40`} stroke="#5f6b5a" strokeWidth={16} fill="none" strokeLinecap="round" />)}
          <path d={`M ${x - 6} ${top} q ${40} 10 ${70} 70`} stroke="#ffffff" strokeWidth={6} fill="none" />
        </g>
      ))}
      <g transform="translate(470 700)" style={{ filter: "blur(1.5px)" }}>
        <path d="M 0 60 L 70 0 L 140 60 Z" fill="#ffffff" />
        <rect x={14} y={60} width={112} height={50} fill="#9aa0ad" />
      </g>
    </svg>
  );
}

function Survivors() {
  const frame = useCurrentFrame();
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {[0, 1, 2].map((i) => {
        const x = 150 + i * 70 + frame * 0.6;
        const bob = Math.abs(Math.sin(frame / 5 + i)) * 4;
        return (
          <g key={i} transform={`translate(${x} ${1130 - bob})`} fill="#1b1c22">
            <circle cx={0} cy={-62} r={10} />
            <rect x={-9} y={-52} width={18} height={36} rx={6} />
            <rect x={-8} y={-18} width={6} height={30} transform={`rotate(${Math.sin(frame / 5 + i) * 14} -5 -18)`} />
            <rect x={2} y={-18} width={6} height={30} transform={`rotate(${-Math.sin(frame / 5 + i) * 14} 5 -18)`} />
          </g>
        );
      })}
    </svg>
  );
}
