import type { ReactNode } from "react";
import type { HudSpec } from "@lib/components/ui/HudCard";
import { RooftopScene } from "@lib/components/sets/RooftopScene";
import { SpaceScene } from "@lib/components/sets/SpaceScene";
import { CountCard } from "@lib/components/ui/Cards";

export type SfxName = "whoosh" | "glitch" | "stamp" | "drone" | "tick" | "rev" | "draw" | "pop" | "thump" | "shimmer" | "boom" | "water" | "scratch" | "alarm" | "creak" | "snap" | "rumble" | "chord" | "sting";

export interface Cut {
  at: number; // start as a fraction of the line's duration
  scene: () => ReactNode;
  hud?: HudSpec[];
  sfx?: SfxName;
}

// One entry per line id in src/data/shots.json. Replace this sample for each clip.
// Full worked examples: .claude/skills/2d-reels/examples/*.storyboard.tsx and clips/*/storyboard.tsx
export const STORYBOARD: Record<string, Cut[]> = {
  "01": [
    { at: 0, sfx: "whoosh", scene: () => <RooftopScene hours={[9, 9.5]} sun={{ t: [0.2, 0.25] }} pose="lookUp" /> },
    { at: 0.5, sfx: "pop", scene: () => <SpaceScene moonDir={1} orbitDegPerSec={20} /> },
  ],
  "02": [
    {
      at: 0,
      sfx: "boom",
      scene: () => (
        <>
          <SpaceScene moonDir={-1} orbitDegPerSec={60} />
          <CountCard th="ตัวเลขสำคัญ" en="key number" from={0} to={1000} unit="หน่วย" red top={110} />
        </>
      ),
    },
  ],
};
