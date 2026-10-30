import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { PLACES, worldMap } from "./worldMap";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MAP = { w: 900, h: 470, x: -90, y: 330 };

type Lonlat = [number, number];

interface Salvo {
  from: Lonlat;
  to: Lonlat[];
  color: string;
  delay: number;
}

function arcPath(a: [number, number], b: [number, number]): string {
  const mx = (a[0] + b[0]) / 2;
  const my = Math.min(a[1], b[1]) - Math.abs(a[0] - b[0]) * 0.35 - 40;
  return `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
}

function Label({ at, th, en }: { at: [number, number]; th: string; en: string }) {
  return (
    <g transform={`translate(${at[0]} ${at[1] - 34})`}>
      <rect x={-62} y={-16} width={124} height={26} rx={13} fill="#f4e9d4" />
      <circle cx={-48} cy={-3} r={4} fill={COLORS.red} />
      <text x={-38} y={2} fontFamily={FONTS.body} fontWeight={700} fontSize={13} fill={COLORS.ink}>{th}</text>
      <text x={24} y={2} fontFamily={FONTS.caps} fontWeight={600} fontSize={8} letterSpacing={1} fill="#6b6f7c">{en}</text>
    </g>
  );
}

export function MapScene({ counter }: { counter: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { projection, landPath } = worldMap(MAP.w, MAP.h, MAP.x, MAP.y);
  const p = (ll: Lonlat) => projection(ll) as [number, number];
  const salvos: Salvo[] = [
    { from: PLACES.usa, to: [PLACES.russia, PLACES.china, PLACES.korea, PLACES.europe, [40, 55], [90, 50]], color: "#ff4d55", delay: counter ? -40 : 0 },
    ...(counter
      ? [
          { from: PLACES.russia, to: [PLACES.usa, [-80, 40], [-120, 37]] as Lonlat[], color: "#ffffff", delay: 0 },
          { from: PLACES.china, to: [[-100, 45], [-75, 42], [-118, 34]] as Lonlat[], color: "#9fd0ff", delay: 6 },
        ]
      : []),
  ];
  const pan = interpolate(frame, [0, durationInFrames], counter ? [-40, -80] : [60, 0]);
  const grid = Array.from({ length: 40 }, (_, i) => i * 32);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1e3a5f, #0d1830 70%)" }}>
      <svg width={720} height={1280} style={{ position: "absolute", transform: `translateX(${pan}px)` }}>
        {grid.map((v) => <line key={v} x1={v - 200} y1={0} x2={v - 200} y2={1280} stroke="#7fa7d9" strokeOpacity={0.06} />)}
        {grid.map((v) => <line key={`h${v}`} x1={-200} y1={v} x2={1000} y2={v} stroke="#7fa7d9" strokeOpacity={0.06} />)}
        <path d={landPath} fill="#3b6a96" stroke="#8fb6dc" strokeOpacity={0.5} strokeWidth={1} />
        {/* city lights */}
        {Array.from({ length: 90 }, (_, i) => {
          const ll: Lonlat = [((i * 47) % 300) - 130, ((i * 31) % 100) - 30];
          const pt = p(ll);
          return <circle key={i} cx={pt[0]} cy={pt[1]} r={1.4} fill="#fff" opacity={0.25} />;
        })}
        {salvos.map((s, si) =>
          s.to.map((dest, di) => {
            const d = arcPath(p(s.from), p(dest));
            const start = s.delay + di * 3;
            const t = interpolate(frame, [start, start + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
            return (
              <path key={`${si}-${di}`} d={d} fill="none" stroke={s.color} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} style={{ filter: `drop-shadow(0 0 6px ${s.color})` }} />
            );
          }),
        )}
        <Label at={p(PLACES.usa)} th="สหรัฐฯ" en="USA" />
        {counter && <Label at={p(PLACES.russia)} th="รัสเซีย" en="RUSSIA" />}
        {counter && <Label at={p(PLACES.china)} th="จีน" en="CHINA" />}
      </svg>
    </AbsoluteFill>
  );
}
