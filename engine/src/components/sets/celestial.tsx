import { COLORS } from "../../theme";

interface MoonDiscProps {
  cx: number;
  cy: number;
  r: number;
  // 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter, 1 = new
  phase: number;
  glow?: number;
  shade?: number; // opacity of the unlit side (low in daylight)
}

// Lit region = semicircle on the lit side + elliptical terminator (rx = r·|cos 2πφ|)
function litPath(r: number, phase: number): string {
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const sweep = k > 0 ? 0 : 1;
  return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${sweep} 0 ${-r} Z`;
}

export function MoonDisc({ cx, cy, r, phase, glow = 0, shade = 0.85 }: MoonDiscProps) {
  const p = ((phase % 1) + 1) % 1;
  const waning = p > 0.5;
  return (
    <g transform={`translate(${cx} ${cy})`} style={{ filter: glow ? `drop-shadow(0 0 ${glow}px rgba(230,236,255,0.85))` : undefined }}>
      <circle r={r} fill={COLORS.moonShade} opacity={shade} />
      <g transform={waning ? "scale(-1 1)" : undefined}>
        <path d={litPath(r, waning ? 1 - p : p)} fill={COLORS.moon} />
      </g>
      <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.16} fill="#000" opacity={0.08} />
      <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.11} fill="#000" opacity={0.08} />
    </g>
  );
}

export function SunDisc({ cx, cy, r, intensity = 1 }: { cx: number; cy: number; r: number; intensity?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r * 2.4} fill={COLORS.sun} opacity={0.15 * intensity} />
      <circle r={r * 1.6} fill={COLORS.sun} opacity={0.25 * intensity} />
      <circle r={r} fill={COLORS.sun} />
    </g>
  );
}

export function EarthGlobe({ cx, cy, r, spin = 0 }: { cx: number; cy: number; r: number; spin?: number }) {
  const id = `earth-clip-${r}`;
  const shift = ((spin % 360) / 360) * r * 4;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r * 1.12} fill={COLORS.earthSea} opacity={0.18} />
      <clipPath id={id}>
        <circle r={r} />
      </clipPath>
      <circle r={r} fill={COLORS.earthSea} />
      <g clipPath={`url(#${id})`}>
        {[-2, 0, 2].map((k) => (
          <g key={k} transform={`translate(${k * r * 2 - shift} 0)`}>
            <path d={`M ${-r * 0.7} ${-r * 0.5} q ${r * 0.3} ${-r * 0.3} ${r * 0.6} 0 q ${r * 0.1} ${r * 0.4} ${-r * 0.2} ${r * 0.6} q ${-r * 0.4} ${r * 0.1} ${-r * 0.4} ${-r * 0.6} z`} fill={COLORS.earthLand} />
            <path d={`M ${r * 0.2} ${r * 0.05} q ${r * 0.4} ${-r * 0.2} ${r * 0.6} ${r * 0.1} q ${-r * 0.1} ${r * 0.5} ${-r * 0.4} ${r * 0.5} q ${-r * 0.3} ${-r * 0.2} ${-r * 0.2} ${-r * 0.6} z`} fill={COLORS.earthLand} />
          </g>
        ))}
        <circle cx={r * 0.55} r={r * 1.05} fill="#000" opacity={0.22} />
      </g>
    </g>
  );
}

// Curved arrow along a circle, from angle a0 to a1 (degrees, SVG convention: 0 = right, positive = clockwise)
export function ArcArrow({ cx, cy, r, a0, a1, color, width = 4 }: { cx: number; cy: number; r: number; a0: number; a1: number; color: string; width?: number }) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const pt = (a: number) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  const sweep = a1 > a0 ? 1 : 0;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const tangent = a1 + (sweep ? 90 : -90);
  const head = 12;
  const hx = (a: number) => x1 + head * Math.cos(rad(a));
  const hy = (a: number) => y1 + head * Math.sin(rad(a));
  return (
    <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`} />
      <path d={`M ${hx(tangent + 150)} ${hy(tangent + 150)} L ${x1} ${y1} L ${hx(tangent - 150)} ${hy(tangent - 150)}`} />
    </g>
  );
}
