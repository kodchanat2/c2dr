import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export function SpeedMeter() {
  const frame = useCurrentFrame();
  const needle = interpolate(frame, [6, 26], [-80, 75], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <g transform="translate(360 1040)">
        <path d="M -120 0 A 120 120 0 0 1 120 0" fill="none" stroke={COLORS.cream} strokeWidth={14} />
        <path d="M 60 -104 A 120 120 0 0 1 120 0" fill="none" stroke={COLORS.red} strokeWidth={14} />
        <line x1={0} y1={0} x2={0} y2={-105} stroke={COLORS.yellow} strokeWidth={7} strokeLinecap="round" transform={`rotate(${needle})`} />
        <circle r={12} fill={COLORS.yellow} />
      </g>
    </svg>
  );
}

function Bar({ y, label, value, width, color }: { y: number; label: string; value: string; width: number; color: string }) {
  return (
    <g transform={`translate(70 ${y})`}>
      <text y={-14} fontFamily={FONTS.caps} fontWeight={800} fontSize={20} letterSpacing={2} fill={COLORS.cream}>
        {label}
      </text>
      <rect width={width} height={44} rx={8} fill={color} />
      <text x={Math.min(width, 520) + 14} y={32} fontFamily={FONTS.display} fontWeight={800} fontSize={30} fill={COLORS.cream}>
        {value}
      </text>
    </g>
  );
}

export function EscapeBars() {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [8, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const moonWidth = 30 + 760 * grow; // deliberately overflows the frame
  const shake = grow > 0.95 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <AbsoluteFill style={{ background: "rgba(20,26,46,0.55)" }}>
      <svg width={720} height={1280} style={{ position: "absolute", transform: `translateX(${shake}px)` }}>
        <Bar y={480} label="ESCAPE VELOCITY" value="1.44" width={32} color={COLORS.blueprint} />
        <Bar y={600} label="MOON SPEED" value="27.95 กม./วิ" width={moonWidth} color={COLORS.red} />
      </svg>
    </AbsoluteFill>
  );
}
