// Rigged SVG cat, front 3/4 view, cel shaded (base + shade side + highlight), with tabby stripes.
import { interpolate, useCurrentFrame } from "remotion";

export type CatPose = "sit" | "beatbox" | "stare" | "loaf";
export type CatCoat = "orange" | "grey" | "black" | "white";

interface CoatColors {
  base: string;
  shade: string;
  light: string;
  stripe: string;
  belly: string;
}

const COATS: Record<CatCoat, CoatColors> = {
  orange: { base: "#e8923e", shade: "#c46f26", light: "#f6b46c", stripe: "#b85f1d", belly: "#f7dcc0" },
  grey: { base: "#8b93a1", shade: "#6b7280", light: "#aab1bd", stripe: "#5d6472", belly: "#d9dde3" },
  black: { base: "#2b2a30", shade: "#1a191d", light: "#44434b", stripe: "#1a191d", belly: "#3a3940" },
  white: { base: "#f1ede6", shade: "#d6cfc4", light: "#ffffff", stripe: "#e4ddd2", belly: "#ffffff" },
};

const BEAT_FRAMES = 16; // ~112 BPM

interface CatProps {
  pose: CatPose;
  x: number;
  y: number; // ground contact point
  scale?: number;
  coat?: CatCoat;
  facing?: 1 | -1;
  rings?: boolean; // sound rings while beatboxing
  phase?: number; // frame offset so a crowd doesn't move in lockstep
}

function Eyes({ pose, blink, c }: { pose: CatPose; blink: number; c: CoatColors }) {
  if (pose === "loaf") {
    return (
      <g stroke="#2a1d16" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M -30 -6 Q -20 2 -10 -6" />
        <path d="M 10 -6 Q 20 2 30 -6" />
      </g>
    );
  }
  const big = pose === "stare";
  const ry = (big ? 15 : 12) * blink;
  return (
    <g>
      {[-20, 20].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-6} rx={big ? 14 : 12} ry={ry} fill="#d7e86a" />
          <ellipse cx={ex} cy={-6} rx={big ? 9 : 4} ry={ry * 0.92} fill="#1d1712" />
          <circle cx={ex + 4} cy={-11} r={3.4 * blink} fill="#fff" />
          <path d={`M ${ex - 13} -8 Q ${ex} -22 ${ex + 13} -8`} fill="none" stroke={c.shade} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

function Mouth({ open }: { open: number }) {
  return (
    <g>
      <path d="M -6 12 L 6 12 L 0 19 Z" fill="#d9707a" />
      {open > 0.05 ? (
        <ellipse cx={0} cy={30} rx={12} ry={4 + 12 * open} fill="#5a2228" />
      ) : (
        <path d="M 0 19 L 0 24 M 0 24 Q -9 31 -15 25 M 0 24 Q 9 31 15 25" fill="none" stroke="#3a2420" strokeWidth={2.6} strokeLinecap="round" />
      )}
      {open > 0.05 && <ellipse cx={0} cy={36 + 6 * open} rx={7} ry={3 * open} fill="#d9707a" />}
    </g>
  );
}

function Head({ pose, frame, c, open, bob }: { pose: CatPose; frame: number; c: CoatColors; open: number; bob: number }) {
  const blink = frame % 110 > 104 ? 0.12 : 1;
  const earUp = pose === "stare" ? -10 : 0;
  const tilt = pose === "beatbox" ? Math.sin((frame / BEAT_FRAMES) * Math.PI) * 6 : pose === "stare" ? 0 : Math.sin(frame / 40) * 3;
  return (
    <g transform={`translate(0 ${-150 + bob}) rotate(${tilt})`}>
      {/* ears */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 40} ${-38 + earUp}) rotate(${s * (pose === "stare" ? 4 : 14)})`}>
          <path d="M -22 18 L 0 -34 L 22 18 Z" fill={c.base} />
          <path d="M -12 12 L 0 -18 L 12 12 Z" fill="#f2a7a7" />
          {s === 1 && <path d="M 0 -34 L 22 18 L 10 18 Z" fill={c.shade} opacity={0.7} />}
        </g>
      ))}
      {/* skull + cheeks; far side shaded */}
      <path d="M -64 4 Q -66 -52 0 -56 Q 66 -52 64 4 Q 60 46 0 50 Q -60 46 -64 4 Z" fill={c.base} />
      <path d="M 20 -55 Q 66 -50 64 4 Q 60 46 6 50 Q 48 20 20 -55 Z" fill={c.shade} opacity={0.55} />
      <path d="M -40 -40 Q -20 -52 0 -50" stroke={c.light} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* tabby forehead stripes */}
      <g stroke={c.stripe} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
        <path d="M 0 -52 L 0 -34" />
        <path d="M -14 -50 L -10 -36" />
        <path d="M 14 -50 L 10 -36" />
        <path d="M -62 -2 L -46 0" />
        <path d="M 62 -2 L 46 0" />
      </g>
      {/* muzzle */}
      <ellipse cx={0} cy={22} rx={30} ry={20} fill={c.belly} />
      <Eyes pose={pose} blink={blink} c={c} />
      <Mouth open={open} />
      {/* whiskers */}
      <g stroke="#fffaf0" strokeWidth={2} strokeLinecap="round" opacity={0.9}>
        {[-1, 1].map((s) => [-4, 4, 12].map((dy) => <line key={`${s}${dy}`} x1={s * 26} y1={20 + dy * 0.5} x2={s * 78} y2={14 + dy} />))}
      </g>
    </g>
  );
}

function SoundRings({ frame }: { frame: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = (((frame + i * (BEAT_FRAMES / 1.5)) % (BEAT_FRAMES * 2)) / (BEAT_FRAMES * 2));
        return <circle key={i} cx={0} cy={-120} r={40 + t * 220} fill="none" stroke="#fff6c8" strokeWidth={6 * (1 - t)} opacity={0.8 * (1 - t)} />;
      })}
    </g>
  );
}

export function Cat({ pose, x, y, scale = 1, coat = "orange", facing = 1, rings = pose === "beatbox", phase = 0 }: CatProps) {
  const frame = useCurrentFrame() + phase;
  const c = COATS[coat];
  const beat = (frame % BEAT_FRAMES) / BEAT_FRAMES;
  const open = pose === "beatbox" ? Math.max(0, Math.sin(beat * Math.PI * 2)) : 0;
  const bob = pose === "beatbox" ? -Math.abs(Math.sin((frame / BEAT_FRAMES) * Math.PI)) * 10 : 0;
  const tail = Math.sin(frame / (pose === "beatbox" ? 6 : 20)) * (pose === "stare" ? 0 : 12);

  if (pose === "loaf") {
    const breathe = 1 + Math.sin(frame / 22) * 0.02;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
        <ellipse cx={0} cy={2} rx={110} ry={14} fill="#000" opacity={0.22} />
        <g transform={`scale(1 ${breathe})`} style={{ transformOrigin: "0 0" }}>
          <path d="M -105 0 Q -110 -90 -10 -96 Q 100 -100 105 0 Z" fill={c.base} />
          <path d="M 30 -96 Q 100 -96 105 0 L 40 0 Q 70 -50 30 -96 Z" fill={c.shade} opacity={0.5} />
          <g stroke={c.stripe} strokeWidth={7} strokeLinecap="round" opacity={0.7}>
            <path d="M -40 -90 Q -30 -60 -44 -30" />
            <path d="M 0 -94 Q 10 -64 -2 -34" />
            <path d="M 40 -90 Q 50 -60 38 -30" />
          </g>
          <path d="M 96 -10 Q 120 -30 90 -40" stroke={c.base} strokeWidth={18} fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(-70 -46) scale(0.82)">
          <Head pose="loaf" frame={frame} c={c} open={0} bob={150} />
        </g>
        <text x={-10} y={-150 - (frame % 60)} fontFamily="Kanit, sans-serif" fontWeight={800} fontSize={34} fill="#fff" opacity={1 - (frame % 60) / 60}>
          z
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <ellipse cx={0} cy={2} rx={90} ry={14} fill="#000" opacity={0.25} />
      {/* tail curls around the body */}
      <path d={`M 60 -10 Q 130 -20 ${120 + tail} ${-90 + tail * 0.5}`} stroke={c.base} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M 60 -10 Q 130 -20 ${120 + tail} ${-90 + tail * 0.5}`} stroke={c.stripe} strokeWidth={22} strokeDasharray="10 16" fill="none" strokeLinecap="round" opacity={0.6} />
      {/* body: pear shape, belly patch, shade side */}
      <path d="M -70 0 Q -84 -90 -40 -140 L 40 -140 Q 84 -90 70 0 Z" fill={c.base} />
      <path d="M 20 -140 L 40 -140 Q 84 -90 70 0 L 30 0 Q 56 -70 20 -140 Z" fill={c.shade} opacity={0.6} />
      <path d="M -30 -120 Q 0 -128 30 -120 Q 40 -60 24 -4 L -24 -4 Q -40 -60 -30 -120 Z" fill={c.belly} />
      <g stroke={c.stripe} strokeWidth={7} strokeLinecap="round" opacity={0.75}>
        <path d="M -70 -60 L -46 -64" />
        <path d="M -74 -34 L -50 -38" />
        <path d="M 72 -60 L 50 -64" />
      </g>
      {/* front paws */}
      {[-22, 22].map((px) => (
        <g key={px}>
          <ellipse cx={px} cy={-6} rx={18} ry={11} fill={c.belly} />
          <path d={`M ${px - 6} -10 L ${px - 6} -2 M ${px + 6} -10 L ${px + 6} -2`} stroke={c.shade} strokeWidth={2} />
        </g>
      ))}
      {rings && <SoundRings frame={frame} />}
      <Head pose={pose} frame={frame} c={c} open={open} bob={bob} />
    </g>
  );
}

/** Frame-driven 0..1 beat pulse for syncing props (cups, rings, lights) to the cats' beat. */
export function useBeat(phase = 0): number {
  const frame = useCurrentFrame() + phase;
  return interpolate((frame % BEAT_FRAMES) / BEAT_FRAMES, [0, 0.15, 1], [1, 0.6, 0]);
}
