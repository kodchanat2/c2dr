// Reference-style info cards: cream paper card, dark chip header, optional source footnote.
import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

interface ShellProps {
  th: string;
  en: string;
  top: number;
  left?: number;
  width?: number;
  delay?: number;
  source?: string;
  children: ReactNode;
}

export function CardShell({ th, en, top, left = 36, width = 520, delay = 0, source, children }: ShellProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 190 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        padding: "14px 22px 14px",
        borderRadius: 10,
        backgroundImage: "linear-gradient(180deg, #fbf4e6, #ecdfc4)",
        boxShadow: "0 18px 36px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.06)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * -36}px) scale(${0.96 + enter * 0.04})`,
      }}
    >
      <Chip th={th} en={en} />
      <div style={{ marginTop: 8 }}>{children}</div>
      {source && <div style={{ marginTop: 8, fontFamily: FONTS.caps, fontWeight: 600, fontSize: 11.5, letterSpacing: 1, color: "rgba(29,36,56,0.45)" }}>{source.toUpperCase()}</div>}
    </div>
  );
}

export function Chip({ th, en, style }: { th: string; en: string; style?: CSSProperties }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.ink, borderRadius: 999, padding: "3px 11px 5px", ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.cream }} />
      <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 16, color: COLORS.cream }}>{th}</span>
      <span style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 12, letterSpacing: 1.2, color: "rgba(244,233,212,0.75)" }}>· {en.toUpperCase()}</span>
    </div>
  );
}

function useCount(from: number, to: number, delay = 4, length = 26): number {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + length], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return from + (to - from) * t;
}

interface CountCardProps extends Omit<ShellProps, "children"> {
  from: number;
  to: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  red?: boolean;
  decimals?: number;
}

export function CountCard({ from, to, unit, prefix = "", suffix = "", red, decimals = 0, ...shell }: CountCardProps) {
  const n = useCount(from, to, (shell.delay ?? 0) + 4);
  return (
    <CardShell {...shell}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, lineHeight: 1, color: red ? COLORS.red : "#2f3445" }}>
          {prefix}
          {n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          {suffix}
        </span>
        {unit && <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: "#6b6f7c" }}>{unit}</span>}
      </div>
    </CardShell>
  );
}

export function RuleCard({ index, th, en, icon, top = 110, delay = 0 }: { index: number; th: string; en: string; icon: ReactNode; top?: number; delay?: number }) {
  return (
    <CardShell th={`กฎข้อ ${index}`} en={`rule ${index}`} top={top} delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={44} height={44} viewBox="0 0 44 44">{icon}</svg>
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, color: COLORS.ink, lineHeight: 1.1 }}>{th}</div>
          <div style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 13, letterSpacing: 1.2, color: "#6b6f7c" }}>{en.toUpperCase()}</div>
        </div>
      </div>
    </CardShell>
  );
}

export const EyeSlashIcon = (
  <g fill="none" stroke={COLORS.ink} strokeWidth={3} strokeLinecap="round">
    <path d="M 4 22 Q 22 6 40 22 Q 22 38 4 22 Z" />
    <circle cx={22} cy={22} r={6} />
    <line x1={6} y1={38} x2={38} y2={6} stroke={COLORS.red} strokeWidth={4} />
  </g>
);

export const DuckIcon = (
  <g fill={COLORS.ink}>
    <circle cx={30} cy={14} r={6} />
    <path d="M 6 36 L 20 24 L 34 26 L 40 36 Z" />
  </g>
);

/** Small top-left pill: clock/day marker such as "ชั่วโมงที่ 1". */
export function TimePill({ th, en, icon = "clock", top = 110 }: { th: string; en: string; icon?: "clock" | "sun"; top?: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, left: 36, opacity: o, display: "flex", alignItems: "center", gap: 10, background: "#fbf4e6", borderRadius: 10, padding: "8px 16px", boxShadow: "0 10px 22px rgba(0,0,0,0.4)" }}>
      <svg width={22} height={22} viewBox="0 0 22 22">
        {icon === "clock" ? (
          <g fill="none" stroke={COLORS.ink} strokeWidth={2.4}>
            <circle cx={11} cy={11} r={9} />
            <path d="M 11 5 L 11 11 L 15 13" strokeLinecap="round" />
          </g>
        ) : (
          <g fill={COLORS.ink}>
            <circle cx={11} cy={11} r={5} />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={10} y={0} width={2} height={4} transform={`rotate(${i * 45} 11 11)`} />)}
          </g>
        )}
      </svg>
      <div>
        <div style={{ fontFamily: FONTS.caps, fontWeight: 600, fontSize: 11, letterSpacing: 1.2, color: "#6b6f7c" }}>{en.toUpperCase()}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 26, lineHeight: 1, color: COLORS.ink }}>{th}</div>
      </div>
    </div>
  );
}

export function BarChartCard({ shrink, top = 110 }: { shrink: boolean; top?: number }) {
  const frame = useCurrentFrame();
  const t = shrink ? interpolate(frame, [4, 30], [1, 0.1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1;
  const pct = useCount(0, shrink ? -90 : 0, 4, 26);
  const bars = [["ข้าว", "rice", "#e2b33c"], ["ข้าวโพด", "maize", "#f0c94b"], ["ข้าวสาลี", "wheat", "#c99a3a"]];
  return (
    <CardShell th="ผลผลิตอาหารโลก" en="world food output" top={top} source="estimate · nuclear winter crop models">
      <div style={{ display: "flex", gap: 34, alignItems: "flex-end", height: 190, padding: "0 20px" }}>
        {bars.map(([th, en, c]) => (
          <div key={en} style={{ textAlign: "center", width: 90 }}>
            <div style={{ height: 160 * t, background: `linear-gradient(${c}, #a87a22)`, borderRadius: "4px 4px 0 0" }} />
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink, marginTop: 6 }}>{th}</div>
            <div style={{ fontFamily: FONTS.caps, fontSize: 11, letterSpacing: 1, color: "#6b6f7c" }}>{en.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.red, lineHeight: 1.1 }}>{Math.round(pct)}%</div>
    </CardShell>
  );
}

export function ChecklistCard({ items, top = 110 }: { items: [string, string][]; top?: number }) {
  const frame = useCurrentFrame();
  return (
    <CardShell th="สิ่งที่หายไป" en="gone" top={top}>
      {items.map(([th, en], i) => {
        const on = frame > 6 + i * 16;
        return (
          <div key={en} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
            <svg width={30} height={30}>
              <circle cx={15} cy={15} r={14} fill={on ? COLORS.red : "#d8ccb2"} />
              {on && <path d="M 9 9 L 21 21 M 21 9 L 9 21" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />}
            </svg>
            <div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, color: on ? "#9aa0ad" : COLORS.ink, textDecoration: on ? "line-through" : undefined, lineHeight: 1 }}>{th}</div>
              <div style={{ fontFamily: FONTS.caps, fontSize: 11, letterSpacing: 1.2, color: "#6b6f7c" }}>{en.toUpperCase()}</div>
            </div>
          </div>
        );
      })}
    </CardShell>
  );
}

export function ThermoCard({ top = 200 }: { top?: number }) {
  const temp = useCount(22, -6, 4, 30);
  const fill = interpolate(temp, [-10, 30], [10, 120]);
  return (
    <CardShell th="อุณหภูมิฤดูร้อน" en="summer temp" top={top} left={300} width={360} source="vs. normal · simulated">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width={40} height={150}>
          <rect x={14} y={4} width={12} height={124} rx={6} fill="#fff" stroke="#9aa0ad" strokeWidth={2} />
          <rect x={16} y={128 - fill} width={8} height={fill} rx={4} fill="#3a7bd5" />
          <circle cx={20} cy={134} r={13} fill="#3a7bd5" />
        </svg>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 56, color: "#3a7bd5" }}>{temp.toFixed(0)}°C</div>
      </div>
    </CardShell>
  );
}

export function MeterCard({ th, en, from, to, icon, top = 110, red }: { th: string; en: string; from: number; to: number; icon: ReactNode; top?: number; red?: boolean }) {
  const v = useCount(from, to, 4, 24);
  return (
    <CardShell th={th} en={en} top={top}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={44} height={44} viewBox="0 0 44 44">{icon}</svg>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 54, lineHeight: 1, color: red ? COLORS.red : "#2f3445" }}>{Math.round(v)}%</div>
      </div>
      <div style={{ height: 8, background: "#d8ccb2", borderRadius: 4, marginTop: 10 }}>
        <div style={{ width: `${v}%`, height: 8, borderRadius: 4, background: red ? COLORS.red : COLORS.yellow }} />
      </div>
    </CardShell>
  );
}

export function QuoteCard({ top = 110 }: { top?: number }) {
  return (
    <CardShell th="คำคม" en="quote" top={top} width={560}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 28, lineHeight: 1.3, color: COLORS.ink }}>
        “สงครามโลกครั้งที่ 4<br />จะสู้กันด้วย<span style={{ color: COLORS.red }}>ไม้และก้อนหิน</span>”
      </div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink, marginTop: 6 }}>— อัลเบิร์ต ไอน์สไตน์</div>
      <div style={{ fontFamily: FONTS.caps, fontSize: 11, letterSpacing: 1.2, color: "#6b6f7c" }}>ALBERT EINSTEIN · ATTRIBUTED</div>
    </CardShell>
  );
}

export function RouteCard({ top = 110 }: { top?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [4, 40], [0, 1], clamp);
  return (
    <CardShell th="เส้นทาง" en="route" top={top} left={400} width={260}>
      <svg width={216} height={110}>
        <rect width={216} height={110} rx={6} fill="#e6dac0" />
        {[30, 70].map((y) => <line key={y} x1={0} y1={y} x2={216} y2={y + 10} stroke="#fff" strokeWidth={5} />)}
        <line x1={80} y1={0} x2={100} y2={110} stroke="#fff" strokeWidth={5} />
        <path d="M 20 90 L 90 72 L 120 36 L 196 22" fill="none" stroke={COLORS.red} strokeWidth={3} strokeDasharray="200" strokeDashoffset={200 * (1 - t)} />
        <circle cx={20} cy={90} r={5} fill={COLORS.ink} />
      </svg>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink }}>เดิน 12 กม.</div>
    </CardShell>
  );
}
