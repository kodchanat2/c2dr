// Sets for the cat-beatbox clip: cardboard box, world cat map, power city, doorstep, cushion blueprint, verdict split.
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { Cat, useBeat, type CatCoat } from "../character/Cat";
import { DepthLayer, Graded, HeaderChip } from "../style/StyleKit";
import { CityLayer } from "./city";
import { worldMap } from "./worldMap";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NAVY_BG = `radial-gradient(circle at 50% 40%, #23406e, ${COLORS.navy} 45%, ${COLORS.navyDeep})`;

/** Open cardboard box, front view. Children render inside (clipped by the front panel). */
export function Box({ x, y, scale = 1, open = 1, children }: { x: number; y: number; scale?: number; open?: number; children?: React.ReactNode }) {
  const flap = interpolate(open, [0, 1], [0, 58]);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={6} rx={200} ry={20} fill="#000" opacity={0.25} />
      {/* back wall + inside shadow */}
      <path d="M -170 -190 L 170 -190 L 150 -150 L -150 -150 Z" fill="#9c6a3c" />
      <rect x={-150} y={-190} width={300} height={40} fill="#6b4524" />
      {/* back flaps */}
      <path d={`M -170 -190 L 170 -190 L ${150} ${-190 - flap} L ${-150} ${-190 - flap} Z`} fill="#b98049" />
      {children}
      {/* front panel */}
      <path d="M -180 -150 L 180 -150 L 170 0 L -170 0 Z" fill="#c98f55" />
      <path d="M 60 -150 L 180 -150 L 170 0 L 70 0 Z" fill="#b07a44" />
      <rect x={-30} y={-150} width={60} height={150} fill="#d9b27a" opacity={0.75} />
      {/* front flaps */}
      <path d={`M -180 -150 L 180 -150 L ${200} ${-150 + flap * 0.9} L ${-200} ${-150 + flap * 0.9} Z`} fill="#d79c5f" />
      <text x={-130} y={-40} fontFamily={FONTS.caps} fontWeight={800} fontSize={20} fill="#7a4e28" opacity={0.7}>
        FRAGILE ↑↑
      </text>
    </g>
  );
}

/** Cats sleeping inside the box; `count` grows as cats climb in. */
export function BoxOfCats({ count, coats, hopIndex }: { count: number; coats: CatCoat[]; hopIndex?: number }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #4a3a30, #1f1813 75%)" }}>
      <svg width={720} height={1280}>
        <Box x={360} y={1000} scale={1.4}>
          {coats.slice(0, count).map((coat, i) => (
            <Cat key={i} pose="loaf" coat={coat} x={-90 + i * 90} y={-130 - (i % 2) * 18} scale={0.6} phase={i * 13} />
          ))}
        </Box>
        {hopIndex !== undefined && (
          <Cat pose="sit" coat={coats[hopIndex]} x={interpolate(frame, [0, 24], [720, 470], clamp)} y={1000 - Math.sin(interpolate(frame, [0, 24], [0, Math.PI], clamp)) * 260} scale={0.7} />
        )}
      </svg>
    </AbsoluteFill>
  );
}

/** World map with pulsing cat markers; `focusThailand` zooms in on Thailand with a big orange cat. */
export function CatMapScene({ focusThailand }: { focusThailand?: boolean }) {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const { projection, landPath } = worldMap(900, 470, -90, 330);
  const spots: [number, number][] = [[-100, 40], [-75, 42], [-58, -15], [2, 47], [13, 52], [37, 55], [77, 22], [100, 15], [116, 40], [139, 36], [151, -33], [28, -26], [-3, 40], [31, 30], [106, 10], [-120, 37]];
  const zoom = focusThailand ? interpolate(frame, [0, 30], [1, 3.2], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1;
  const th = projection([100.9, 15.5]) as [number, number];
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <svg width={720} height={1280} style={{ transform: `scale(${zoom})`, transformOrigin: `${th[0]}px ${th[1]}px` }}>
        <path d={landPath} fill="#3b6a96" stroke="#8fb6dc" strokeOpacity={0.5} />
        {spots.map((ll, i) => {
          const [x, y] = projection(ll) as [number, number];
          const on = interpolate(frame, [i * 1.5, i * 1.5 + 6], [0, 1], clamp);
          return (
            <g key={i} opacity={on}>
              <circle cx={x} cy={y} r={8 + beat * 26} fill="none" stroke="#ffd36b" strokeWidth={2} opacity={1 - beat * 0.7} />
              <circle cx={x} cy={y} r={6} fill="#f2a24e" />
            </g>
          );
        })}
        {focusThailand && <Cat pose="beatbox" coat="orange" x={th[0]} y={th[1] + 12} scale={0.16 * interpolate(frame, [20, 34], [0, 1], clamp)} />}
      </svg>
    </AbsoluteFill>
  );
}

/** Night city whose lights and power lines follow `power` (0..1); with `sweep`, power drains left→right over the shot. */
export function PowerCityScene({ sweep, catWindows }: { sweep?: boolean; catWindows?: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = useBeat();
  const drain = sweep ? interpolate(frame, [6, durationInFrames - 10], [0, 1], clamp) : 0;
  const lights = 1 - drain;
  return (
    <Graded>
      <AbsoluteFill style={{ background: "linear-gradient(#070b1f, #1b2552)" }}>
        <DepthLayer blur={6}>
          <CityLayer seed={11} base={900} count={22} topRange={[460, 680]} widthRange={[50, 95]} fill="#1d2547" shade="rgba(0,0,0,0.15)" lights={lights} windowColor="#ffd98a" />
        </DepthLayer>
        <CityLayer seed={29} base={1060} count={12} topRange={[620, 820]} widthRange={[80, 140]} fill="#141a35" shade="rgba(0,0,0,0.2)" lights={lights} windowColor={COLORS.yellow} />
        <svg width={720} height={1280} style={{ position: "absolute" }}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M -20 ${960 + i * 40} Q 360 ${1010 + i * 40} 740 ${960 + i * 40}`} stroke={lights > 0.1 ? "#9fe0ff" : "#2a2f45"} strokeWidth={3} fill="none" opacity={0.5 + 0.5 * beat * lights} style={{ filter: lights > 0.1 ? "drop-shadow(0 0 6px #9fe0ff)" : undefined }} />
          ))}
          {catWindows &&
            [[90, 820], [250, 760], [420, 840], [600, 780]].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 40} y={y - 50} width={80} height={70} fill="#ffd98a" opacity={lights} />
                <Cat pose="beatbox" coat="black" x={x} y={y + 18} scale={0.22} phase={i * 4} rings={false} />
              </g>
            ))}
        </svg>
      </AbsoluteFill>
    </Graded>
  );
}

/** Condo corridor: a parcel slides to the door. */
export function DoorstepScene() {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [4, 26], [-300, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <Graded>
      <AbsoluteFill style={{ background: "linear-gradient(#2a2d3a, #15161d)" }}>
        <DepthLayer blur={3}>
          <svg width={720} height={1280} style={{ position: "absolute" }}>
            <rect x={200} y={360} width={320} height={640} rx={6} fill="#4a3426" />
            <rect x={220} y={380} width={280} height={600} rx={4} fill="#5c4130" />
            <circle cx={470} cy={700} r={12} fill="#c9a24e" />
            <rect x={330} y={420} width={60} height={24} rx={4} fill="#c9a24e" />
            <rect x={0} y={1000} width={720} height={280} fill="#3a3a44" />
          </svg>
        </DepthLayer>
        <svg width={720} height={1280} style={{ position: "absolute" }}>
          <g transform={`translate(${360 + slide} 1080)`}>
            <rect x={-120} y={-150} width={240} height={150} fill="#c98f55" />
            <rect x={-120} y={-90} width={240} height={26} fill="#d9b27a" />
            <rect x={-60} y={-130} width={120} height={50} fill="#f4efe7" />
            <text x={0} y={-98} textAnchor="middle" fontFamily={FONTS.caps} fontWeight={800} fontSize={16} fill={COLORS.ink}>TO: ALL CATS</text>
          </g>
        </svg>
      </AbsoluteFill>
    </Graded>
  );
}

/** Blueprint exploded view of the piezo cushion. */
export function CushionBlueprint() {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const spread = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const layers: [string, string, string][] = [["ผ้าหุ้มนุ่ม", "SOFT COVER", "#5a9bf0"], ["แผ่นเพียโซ", "PIEZO FILM", "#ffd36b"], ["วงจรเก็บไฟ", "HARVEST CIRCUIT", "#7cc47f"], ["แบตเตอรี่", "BATTERY", "#e5484d"]];
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <HeaderChip th="สิ่งประดิษฐ์ · เบาะแมวพลังงาน" en="invention · cat piezo cushion" />
      <svg width={720} height={1280}>
        {Array.from({ length: 43 }, (_, i) => <line key={i} x1={i * 30} y1={0} x2={i * 30} y2={1280} stroke={COLORS.blueprint} strokeOpacity={i % 4 ? 0.05 : 0.14} />)}
        <Cat pose="beatbox" coat="orange" x={360} y={360 - spread * 40} scale={0.75} />
        {layers.map(([th, en, c], i) => {
          const y = 420 + i * (30 + spread * 70);
          return (
            <g key={en}>
              <path d={`M 190 ${y} L 530 ${y} L 580 ${y + 30} L 140 ${y + 30} Z`} fill={c} opacity={0.85} stroke="#cfe0ff" strokeWidth={1.5} />
              <line x1={580} y1={y + 15} x2={620} y2={y + 15} stroke="#cfe0ff" strokeOpacity={0.6 * spread} />
              <text x={626} y={y + 12} fontFamily={FONTS.display} fontWeight={700} fontSize={17} fill={COLORS.cream} opacity={spread}>{th}</text>
              <text x={626} y={y + 30} fontFamily={FONTS.caps} fontWeight={600} fontSize={9} letterSpacing={1} fill={COLORS.blueprint} opacity={spread}>{en}</text>
            </g>
          );
        })}
        <path d={`M 360 ${740 + spread * 200} L 340 ${790 + spread * 200} L 362 ${790 + spread * 200} L 344 ${850 + spread * 200}`} stroke={COLORS.yellow} strokeWidth={8} fill="none" strokeLinejoin="round" opacity={0.4 + 0.6 * beat} style={{ filter: "drop-shadow(0 0 10px #ffd36b)" }} />
      </svg>
    </AbsoluteFill>
  );
}

/** Verdict: oil barrel crossed out vs the cardboard box ticked. */
export function VerdictScene() {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [6, 14], [0, 1], clamp);
  const tick = interpolate(frame, [20, 28], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <svg width={720} height={1280}>
        <g transform="translate(190 700)">
          <rect x={-80} y={-200} width={160} height={220} rx={14} fill="#2f3a4f" />
          {[-150, -80, -10].map((y) => <rect key={y} x={-84} y={y} width={168} height={10} fill="#1d2433" />)}
          <text x={0} y={60} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={26} fill={COLORS.cream}>น้ำมัน</text>
          <path d="M -90 -210 L 90 20 M 90 -210 L -90 20" stroke={COLORS.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - x} />
        </g>
        <Box x={530} y={720} scale={0.55} />
        <text x={530} y={780} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={26} fill={COLORS.cream}>กล่องลัง</text>
        <path d="M 470 520 L 515 565 L 600 470" stroke="#7cc47f" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - tick} />
      </svg>
    </AbsoluteFill>
  );
}
