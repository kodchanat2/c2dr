// Bangkok-ish city layers for the rooftop scene. Deterministic (seeded), drawn as plain SVG.
import { seeded } from "../style/StyleKit";

interface Building {
  x: number;
  w: number;
  top: number;
  tone: number; // 0..1 lightness variation
  kind: "slab" | "stepped" | "spire" | "condo";
  winSeed: number;
}

function makeBuildings(seed: number, count: number, minTop: number, maxTop: number, minW: number, maxW: number): Building[] {
  const r = seeded(seed);
  const kinds: Building["kind"][] = ["slab", "condo", "stepped", "slab", "spire", "condo"];
  const out: Building[] = [];
  let x = -40;
  for (let i = 0; i < count && x < 760; i++) {
    const w = minW + r() * (maxW - minW);
    out.push({ x, w, top: minTop + r() * (maxTop - minTop), tone: r(), kind: kinds[Math.floor(r() * kinds.length)], winSeed: Math.floor(r() * 1e6) });
    x += w * (0.7 + r() * 0.45);
  }
  return out;
}

function Windows({ b, base, lit, color }: { b: Building; base: number; lit: number; color: string }) {
  const r = seeded(b.winSeed);
  const cols = Math.max(2, Math.floor(b.w / 18));
  const rows = Math.floor((base - b.top - 20) / 22);
  const cw = (b.w - 12) / cols;
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      const on = r() < 0.55;
      cells.push(
        <rect key={`${row}-${c}`} x={b.x + 6 + c * cw + cw * 0.18} y={b.top + 16 + row * 22} width={cw * 0.64} height={11} fill={on ? color : "#000"} opacity={on ? lit * (0.5 + r() * 0.5) : 0.12} />,
      );
    }
  }
  return <g>{cells}</g>;
}

function BuildingShape({ b, base, fill, shade }: { b: Building; base: number; fill: string; shade: string }) {
  const h = base - b.top;
  return (
    <g>
      {b.kind === "stepped" && (
        <>
          <rect x={b.x + b.w * 0.15} y={b.top - 40} width={b.w * 0.7} height={44} fill={fill} />
          <rect x={b.x + b.w * 0.3} y={b.top - 70} width={b.w * 0.4} height={34} fill={fill} />
        </>
      )}
      {b.kind === "spire" && <path d={`M ${b.x + b.w / 2 - 3} ${b.top - 90} L ${b.x + b.w / 2 + 3} ${b.top - 90} L ${b.x + b.w / 2 + 10} ${b.top} L ${b.x + b.w / 2 - 10} ${b.top} Z`} fill={fill} />}
      <rect x={b.x} y={b.top} width={b.w} height={h} fill={fill} />
      {/* shaded side plane gives each block volume */}
      <rect x={b.x + b.w * 0.78} y={b.top} width={b.w * 0.22} height={h} fill={shade} />
      {b.kind === "condo" &&
        Array.from({ length: Math.floor(h / 44) }, (_, i) => <rect key={i} x={b.x - 4} y={b.top + 30 + i * 44} width={b.w + 8} height={4} fill={shade} />)}
      {/* rooftop clutter */}
      <rect x={b.x + b.w * 0.2} y={b.top - 12} width={14} height={12} fill={fill} />
      <line x1={b.x + b.w * 0.6} y1={b.top} x2={b.x + b.w * 0.6} y2={b.top - 26} stroke={fill} strokeWidth={2} />
    </g>
  );
}

interface CityLayerProps {
  seed: number;
  base: number;
  count: number;
  topRange: [number, number];
  widthRange: [number, number];
  fill: string;
  shade: string;
  lights: number;
  windowColor: string;
}

export function CityLayer({ seed, base, count, topRange, widthRange, fill, shade, lights, windowColor }: CityLayerProps) {
  const buildings = makeBuildings(seed, count, topRange[0], topRange[1], widthRange[0], widthRange[1]);
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {buildings.map((b, i) => (
        <g key={i}>
          <BuildingShape b={b} base={base} fill={fill} shade={shade} />
          <Windows b={b} base={base} lit={lights} color={windowColor} />
        </g>
      ))}
      <rect x={0} y={base} width={720} height={1280 - base} fill={fill} />
    </svg>
  );
}

/** Mid-ground rooftop props: water tanks, AC units, satellite dish, clothesline. */
export function RooftopProps({ dayLight }: { dayLight: number }) {
  const metal = dayLight > 0.5 ? "#8d97ad" : "#4a5370";
  const metalShade = dayLight > 0.5 ? "#68728a" : "#353c55";
  const tank = dayLight > 0.5 ? "#4e7fb8" : "#2d4468";
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {/* water tank on a stand */}
      <g transform="translate(70 840)">
        <rect x={10} y={60} width={6} height={120} fill={metalShade} />
        <rect x={104} y={60} width={6} height={120} fill={metalShade} />
        <line x1={10} y1={150} x2={110} y2={90} stroke={metalShade} strokeWidth={4} />
        <rect x={0} y={0} width={120} height={70} rx={30} fill={tank} />
        <rect x={0} y={18} width={120} height={6} fill="#000" opacity={0.15} />
        <rect x={84} y={0} width={36} height={70} rx={18} fill="#000" opacity={0.18} />
      </g>
      {/* AC condensers */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${230 + i * 92} 958)`}>
          <rect width={82} height={62} rx={5} fill={metal} />
          <circle cx={30} cy={31} r={22} fill={metalShade} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={30} y1={31} x2={30 + 20 * Math.cos(k * 1.57)} y2={31 + 20 * Math.sin(k * 1.57)} stroke={metal} strokeWidth={3} />)}
          <rect x={60} y={10} width={14} height={42} fill={metalShade} opacity={0.6} />
        </g>
      ))}
      {/* satellite dish */}
      <g transform="translate(640 905)">
        <ellipse cx={0} cy={0} rx={34} ry={40} fill={metal} transform="rotate(-25)" />
        <line x1={0} y1={0} x2={22} y2={-20} stroke={metalShade} strokeWidth={3} />
        <rect x={-4} y={30} width={8} height={90} fill={metalShade} />
      </g>
      {/* railing */}
      <g stroke={metal} strokeWidth={5}>
        <line x1={0} y1={960} x2={720} y2={960} />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 60 + 10} y1={960} x2={i * 60 + 10} y2={1040} />)}
      </g>
      {/* clothesline with laundry */}
      <path d="M 0 800 Q 200 830 420 805" fill="none" stroke="#2b2b2b" strokeWidth={2} />
      {[[60, "#e5484d"], [130, "#f4e9d4"], [230, "#4e7fb8"], [320, "#7cc47f"]].map(([x, c]) => (
        <path key={x as number} d={`M ${x} ${812} l 40 3 l -4 52 l -32 -2 Z`} fill={c as string} opacity={0.9} />
      ))}
    </svg>
  );
}

/** Tiled roof floor with perspective seams. */
export function RoofFloor({ dayLight }: { dayLight: number }) {
  const base = dayLight > 0.5 ? "#8a8f9c" : "#3a4160";
  const seam = dayLight > 0.5 ? "#767b88" : "#30364f";
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <rect x={0} y={1030} width={720} height={250} fill={base} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 90} y1={1030} x2={(i - 4) * 220 + 360} y2={1280} stroke={seam} strokeWidth={2} />)}
      {[1070, 1130, 1210].map((y) => <line key={y} x1={0} y1={y} x2={720} y2={y} stroke={seam} strokeWidth={2} />)}
      <rect x={0} y={1030} width={720} height={14} fill="#000" opacity={0.15} />
    </svg>
  );
}

/** Out-of-focus foreground plant to frame the shot. */
export function ForegroundLeaves() {
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      {[
        [-30, 1180, -30], [40, 1230, -10], [-10, 1100, -55], [90, 1260, 10],
      ].map(([x, y, a], i) => (
        <path key={i} d="M 0 0 Q 60 -90 0 -220 Q -60 -90 0 0 Z" transform={`translate(${x} ${y}) rotate(${a})`} fill={i % 2 ? "#2f6b3f" : "#3d8150"} />
      ))}
      <rect x={-20} y={1190} width={150} height={120} rx={20} fill="#7a4a32" />
    </svg>
  );
}
