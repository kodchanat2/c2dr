import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, LAYOUT } from "../../theme";

export type CountUp = { from: number; to: number; decimals?: number };

export type HudSpec = {
  label: string;
  en: string;
  value: string | CountUp;
  prefix?: string;
  suffix?: string;
  tone?: "ink" | "red";
};

const COUNT_FRAMES = 24;

const formatCount = (v: CountUp, frame: number) => {
  const t = interpolate(frame, [4, 4 + COUNT_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const n = v.from + (v.to - v.from) * t;
  return n.toLocaleString("en-US", { minimumFractionDigits: v.decimals ?? 0, maximumFractionDigits: v.decimals ?? 0 });
};

export function HudCard({ spec, index = 0 }: { spec: HudSpec; index?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - index * 5, fps, config: { damping: 15, stiffness: 180 } });
  const value = typeof spec.value === "string" ? spec.value : formatCount(spec.value, frame);
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.hudTop + index * 150,
        left: LAYOUT.gutter,
        minWidth: 300,
        maxWidth: 520,
        padding: "14px 22px 16px",
        background: COLORS.cream,
        borderRadius: 14,
        border: `2px solid ${COLORS.creamEdge}`,
        borderLeft: `6px solid ${spec.tone === "red" ? COLORS.red : COLORS.blueprint}`,
        backgroundImage: "linear-gradient(180deg, #fbf4e6, #efe2c8)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * -40}px)`,
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 6, background: COLORS.ink, borderRadius: 999, padding: "3px 12px 5px" }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: spec.tone === "red" ? COLORS.red : COLORS.blueprint }} />
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 16, color: COLORS.cream }}>{spec.label}</span>
        <span style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 11, letterSpacing: 1.4, color: "rgba(244,233,212,0.7)" }}>· {spec.en.toUpperCase()}</span>
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.05,
          color: spec.tone === "red" ? COLORS.red : "#3a3f4f",
        }}
      >
        {spec.prefix}
        {value}
        {spec.suffix && <span style={{ fontSize: 26, fontWeight: 700, marginLeft: 8 }}>{spec.suffix}</span>}
      </div>
    </div>
  );
};
