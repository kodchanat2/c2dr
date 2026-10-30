// Cel-shaded smoke: clustered toon puffs that rise, swell and fade; a light CSS blur softens the bands
// so it reads like the references' painted smoke rather than CG.
import { useCurrentFrame } from "remotion";
import { seeded } from "../style/StyleKit";
import { GEO, ToonMesh, ToonStage } from "./toon";

export interface SmokeColumn {
  x: number; // world units, about -3..3 across the frame
  base: number; // world y of the source
  height: number; // how far puffs rise before fading
  width?: number;
  color?: string;
  glow?: string; // emissive tint from fire below
}

const PUFFS_PER_COLUMN = 34;
const LIFE_FRAMES = 150;

function Column({ col, seed }: { col: SmokeColumn; seed: number }) {
  const frame = useCurrentFrame();
  const r = seeded(seed);
  const puffs = Array.from({ length: PUFFS_PER_COLUMN }, (_, i) => ({ phase: i / PUFFS_PER_COLUMN, jx: r() - 0.5, jz: r() - 0.5, size: 0.7 + r() * 0.6, rot: r() * 6 }));
  const width = col.width ?? 1;
  return (
    <group position={[col.x, col.base, 0]}>
      {puffs.map((p, i) => {
        const life = (((frame / LIFE_FRAMES + p.phase) % 1) + 1) % 1;
        const y = life * col.height;
        const spread = 0.35 + life * 1.1;
        const s = p.size * width * (0.6 + life * 1.4);
        const opacity = Math.min(1, life * 6) * (1 - life) * 0.8;
        return (
          <ToonMesh
            key={i}
            geometry={GEO.puff}
            color={col.color ?? "#3a3a42"}
            emissive={life < 0.25 ? col.glow ?? "#000000" : "#000000"}
            position={[p.jx * spread * width + Math.sin(frame / 30 + i) * 0.1, y, p.jz * spread]}
            rotation={[p.rot, p.rot * 0.5, 0]}
            scale={s}
            opacity={Math.max(0.01, opacity)}
            outline={false}
            soft
          />
        );
      })}
    </group>
  );
}

export function CelSmoke({ columns, blur = 7, sun = "#ffe2c2" }: { columns: SmokeColumn[]; blur?: number; sun?: string }) {
  return (
    <ToonStage camera={[0, 0, 14]} fov={40} style={{ filter: `blur(${blur}px)` }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 6, 6]} intensity={1.6} color={sun} />
      <directionalLight position={[0, -6, 2]} intensity={0.6} color="#ff8a4a" />
      {columns.map((c, i) => (
        <Column key={i} col={c} seed={100 + i * 17} />
      ))}
    </ToonStage>
  );
}
