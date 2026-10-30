import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../../theme";
import { DepthLayer } from "../style/StyleKit";
import { worldMap } from "./worldMap";
import { SkinnedHand, SKIN_POSES } from "../toon/SkinnedHand";
import { ToonLights, ToonStage } from "../toon/toon";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Screen() {
  const frame = useCurrentFrame();
  const { landPath } = worldMap(520, 300, 100, 150);
  const pulse = 0.75 + 0.25 * Math.sin(frame / 3);
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <rect x={70} y={120} width={580} height={380} rx={10} fill="#1a0507" stroke="#3a1013" strokeWidth={14} />
      <rect x={84} y={134} width={552} height={352} fill="#5a0a10" />
      <path d={landPath} fill="#c4202b" opacity={0.85 * pulse} />
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={84} y1={134 + i * 20} x2={636} y2={134 + i * 20} stroke="#000" strokeOpacity={0.18} />)}
      <text x={360} y={460} textAnchor="middle" fontFamily={FONTS.caps} fontWeight={800} fontSize={34} letterSpacing={8} fill="#ff4d55" opacity={pulse}>
        DEFCON 1
      </text>
      {/* side status lights */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <circle cx={40} cy={160 + i * 40} r={5} fill={i % 3 ? "#3cff7a" : "#ff3b3b"} opacity={(frame + i * 7) % 20 < 12 ? 1 : 0.3} />
          <circle cx={680} cy={160 + i * 40} r={5} fill={i % 2 ? "#3cff7a" : "#ffb02e"} opacity={(frame + i * 5) % 16 < 9 ? 1 : 0.3} />
        </g>
      ))}
    </svg>
  );
}

function Console({ pressAt }: { pressAt?: number }) {
  const frame = useCurrentFrame();
  const pressed = pressAt !== undefined && frame >= pressAt + 6;
  return (
    <svg width={720} height={1280} style={{ position: "absolute" }}>
      <path d="M 0 840 L 720 840 L 720 1280 L 0 1280 Z" fill="#1c1d24" />
      <path d="M 0 840 L 720 840 L 720 870 L 0 870 Z" fill="#2c2d36" />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={30 + i * 18} cy={900} r={3} fill={i % 4 ? "#9aa0ad" : "#ffb02e"} opacity={0.6} />)}
      {[[150, 960], [260, 990]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <circle r={34} fill="#0e0f14" stroke="#4a4c58" strokeWidth={5} />
          <line x1={0} y1={0} x2={20 * Math.cos(frame / 10 + x)} y2={20 * Math.sin(frame / 10 + x)} stroke="#ff4d55" strokeWidth={3} />
        </g>
      ))}
      {/* hazard frame + button */}
      <g transform="translate(460 930)">
        <rect x={-90} y={-70} width={180} height={140} rx={10} fill="#e0b21a" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-90 + i * 26} -70 l 16 0 l -40 140 l -16 0 Z`} fill="#111" />)}
        <rect x={-66} y={-48} width={132} height={96} rx={8} fill="#1c1d24" />
        <ellipse cx={0} cy={pressed ? 6 : 0} rx={46} ry={36} fill="#c4111b" />
        <ellipse cx={-10} cy={pressed ? -2 : -10} rx={22} ry={12} fill="#ff6b6b" opacity={0.6} />
      </g>
    </svg>
  );
}

function Lasers() {
  const frame = useCurrentFrame();
  return (
    <svg width={720} height={1280} style={{ position: "absolute", mixBlendMode: "screen" }}>
      {[0, 1].map((i) => {
        const a = Math.sin(frame / 18 + i * 2) * 30 + (i ? 140 : 40);
        const r = (a * Math.PI) / 180;
        return <line key={i} x1={360 + (i ? 200 : -200)} y1={0} x2={360 + (i ? 200 : -200) + 1600 * Math.cos(r)} y2={1600 * Math.sin(r)} stroke="#ff2a35" strokeWidth={6} opacity={0.55} style={{ filter: "blur(2px)" }} />;
      })}
    </svg>
  );
}

export function WarRoomScene({ pressAt }: { pressAt?: number }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.04, 1.1]);
  const flash = pressAt !== undefined ? interpolate(frame, [pressAt + 6, pressAt + 9, pressAt + 20], [0, 0.5, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #3a0b10, #0c0306 70%)", transform: `scale(${zoom})` }}>
      <DepthLayer blur={2}>
        <Screen />
      </DepthLayer>
      <Lasers />
      <Console pressAt={pressAt} />
      <ToonStage camera={[0, 0, 13]} fov={34}>
        <ToonLights keyColor="#ffd0d0" rim="#ff5a5a" rimIntensity={2.4} />
        <SkinnedHand
          side="right"
          pose={SKIN_POSES.point}
          position={[0.72, pressAt !== undefined ? interpolate(frame, [0, pressAt, pressAt + 6], [-5.0, -3.6, -3.35], clamp) : -4.2, 1]}
          rotation={[-0.3, Math.PI, -0.12]}
          scale={1.6}
          forearm={4}
          sleeve="#2f3b2a"
        />
      </ToonStage>
      <AbsoluteFill style={{ background: "#ff2a35", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
}
