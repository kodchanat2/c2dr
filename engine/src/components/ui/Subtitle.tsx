import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, LAYOUT } from "../../theme";

type Span = { text: string; tone?: "y" | "r" | "R" };

// "{y:text}" yellow, "{r:text}" red, "{R:text}" red pill box
export const parseMarkup = (s: string): Span[] =>
  s.split(/(\{[yrR]:[^}]*\})/).filter(Boolean).map((part) => {
    const m = part.match(/^\{([yrR]):([^}]*)\}$/);
    return m ? { text: m[2], tone: m[1] as Span["tone"] } : { text: part };
  });

function SpanView({ span, pop }: { span: Span; pop: number }) {
  if (!span.tone) return <span>{span.text}</span>;
  const keep = { whiteSpace: "nowrap" } as const;
  if (span.tone === "R") {
    return (
      <span
        style={{
          background: COLORS.red,
          color: COLORS.white,
          padding: "2px 14px 6px",
          borderRadius: 10,
          display: "inline-block",
          WebkitTextStroke: "0px",
          ...keep,
          transform: `scale(${pop})`,
          boxShadow: "0 6px 18px rgba(229,72,77,0.45)",
        }}
      >
        {span.text}
      </span>
    );
  }
  return <span style={{ ...keep, color: span.tone === "y" ? COLORS.yellow : COLORS.red }}>{span.text}</span>;
};

export function Subtitle({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const pop = interpolate(spring({ frame: frame - 3, fps, config: { damping: 8 } }), [0, 1], [0.6, 1]);
  return (
    <div
      style={{
        position: "absolute",
        top: height * LAYOUT.subtitleY,
        left: LAYOUT.gutter,
        right: LAYOUT.gutter,
        textAlign: "center",
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: 40,
        lineHeight: 1.35,
        color: COLORS.white,
        WebkitTextStroke: "9px rgba(12,14,24,0.92)",
        paintOrder: "stroke fill",
        textShadow: "0 4px 12px rgba(0,0,0,0.5)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 14}px)`,
      }}
    >
      {parseMarkup(text).map((s, i) => (
        <SpanView key={i} span={s} pop={pop} />
      ))}
    </div>
  );
};
