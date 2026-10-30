import type { ReactNode } from "react";
import type { HudSpec } from "./components/ui/HudCard";
import { SpaceScene } from "./components/scenes/SpaceScene";
import { RooftopScene } from "./components/scenes/RooftopScene";
import { BeachScene, NeptuneScene, PhaseStripScene, SplitMoonriseScene } from "./components/scenes/MiscScenes";
import { EscapeBars, SpeedMeter } from "./components/scenes/overlays";

export type SfxName = "whoosh" | "glitch" | "stamp" | "drone" | "tick" | "rev" | "draw" | "pop" | "thump" | "shimmer" | "boom" | "water" | "scratch" | "alarm" | "creak" | "snap" | "rumble" | "chord" | "sting";

export interface Cut {
  at: number; // start as a fraction of the line's duration
  scene: () => ReactNode;
  hud?: HudSpec[];
  sfx?: SfxName;
}

// Retrograde Moon flips into view in 1a; most space shots stay retrograde (-1)
export const STORYBOARD: Record<string, Cut[]> = {
  "01": [
    { at: 0, sfx: "glitch", scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={30} flipAt={22} zoom={[1, 1.12]} header={{ th: "สมมติ · ดวงจันทร์โคจรสวนทาง", en: "what if · retrograde moon" }} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} /> },
    { at: 0.5, sfx: "stamp", scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={220} trail stamp="1 วัน" header={{ th: "สมมติ · ครบรอบใน 1 วัน", en: "what if · 1-day orbit" }} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} /> },
  ],
  "02": [{ at: 0, sfx: "drone", scene: () => <RooftopScene hours={[22, 22.3]} moon={{ t: [0.55, 0.62], phase: [0.5, 0.5] }} pose="lookUp" wobble /> }],
  "03": [
    {
      at: 0,
      sfx: "tick",
      hud: [{ label: "คาบโคจร", en: "orbit period", value: "27.3", suffix: "วัน" }],
      scene: () => <SpaceScene moonDir={1} orbitDegPerSec={12} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} />,
    },
  ],
  "04": [
    {
      at: 0,
      sfx: "rev",
      hud: [{ label: "ความเร็ว", en: "orbital speed", value: { from: 1, to: 28 }, suffix: "กม./วิ", tone: "red" }],
      scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={160} flipAt={4} trail overlay={<SpeedMeter />} />,
    },
  ],
  "05": [
    {
      at: 0,
      sfx: "draw",
      hud: [{ label: "ระยะห่าง", en: "distance", value: { from: 0, to: 384400 }, suffix: "กม." }],
      scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={20} distance footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} />,
    },
  ],
  "06": [
    {
      at: 0,
      sfx: "pop",
      hud: [{ label: "เวลา", en: "time", value: "09:00" }],
      scene: () => <RooftopScene hours={[8.6, 9.2]} moon={{ t: [0.0, 0.07], phase: [0.84, 0.86] }} sun={{ t: [0.2, 0.22] }} pose="yawn" />,
    },
  ],
  "07": [
    {
      at: 0,
      sfx: "whoosh",
      hud: [{ label: "ความเร็วบนฟ้า", en: "sky speed", value: "30°", suffix: "/ชม." }],
      scene: () => <RooftopScene hours={[9.5, 11.5]} moon={{ t: [0.1, 0.42], phase: [0.93, 0.97] }} sun={{ t: [0.26, 0.4] }} pose="lookUp" speedLines />,
    },
  ],
  "08": [
    {
      at: 0,
      sfx: "thump",
      hud: [{ label: "เวลา", en: "time", value: "12:00" }],
      scene: () => <RooftopScene hours={[11.8, 12.1]} moon={{ t: [0.44, 0.5], phase: [0.97, 1.0] }} sun={{ t: [0.49, 0.5] }} pose="lookUp" />,
    },
  ],
  "09": [
    {
      at: 0,
      sfx: "whoosh",
      hud: [{ label: "เวลา", en: "time", value: "15:00" }],
      scene: () => <RooftopScene hours={[14.6, 15.1]} moon={{ t: [0.9, 1.04], phase: [0.12, 0.13] }} sun={{ t: [0.72, 0.74] }} pose="idle" />,
    },
  ],
  "10": [
    {
      at: 0,
      sfx: "pop",
      hud: [{ label: "เวลา", en: "time", value: "21:00" }],
      scene: () => <RooftopScene hours={[19.5, 21]} moon={{ t: [0.06, 0.15], phase: [0.36, 0.38] }} pose="lookUp" />,
    },
  ],
  "11": [
    {
      at: 0,
      sfx: "shimmer",
      hud: [{ label: "เวลา", en: "time", value: "00:00" }],
      scene: () => <RooftopScene hours={[23.8, 24]} moon={{ t: [0.48, 0.52], phase: [0.5, 0.5], r: 50 }} pose="point" rim={1} />,
    },
  ],
  "12": [
    { at: 0, sfx: "pop", hud: [{ label: "จันทร์ขึ้น", en: "moonrise", value: "2", suffix: "ครั้ง/วัน" }], scene: () => <SplitMoonriseScene /> },
    { at: 0.5, sfx: "whoosh", scene: () => <PhaseStripScene /> },
  ],
  "13": [{ at: 0, sfx: "boom", scene: () => <RooftopScene hours={[12, 12]} moon={{ t: [0.47, 0.5], phase: [0, 0], r: 44 }} sun={{ t: [0.5, 0.5] }} pose="shades" eclipse /> }],
  "14": [{ at: 0, sfx: "water", hud: [{ label: "น้ำขึ้น", en: "high tides", value: { from: 2, to: 4 }, suffix: "ครั้ง/วัน" }], scene: () => <BeachScene /> }],
  "15": [{ at: 0, sfx: "scratch", scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={160} freezeAt={6} zoom={[1, 1.5]} zoomOrigin={[360, 265]} moonLabel="28 กม./วิ" header={{ th: "เดี๋ยวก่อน · เช็คความเร็ว", en: "reality check · speed" }} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} /> }],
  "16": [
    {
      at: 0,
      sfx: "alarm",
      hud: [{ label: "ความเร็วหลุดพ้น", en: "escape velocity", value: "1.44", suffix: "กม./วิ", tone: "red" }],
      scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={0} overlay={<EscapeBars />} />,
    },
  ],
  "17": [
    {
      at: 0,
      sfx: "creak",
      hud: [{ label: "แรงที่ต้องใช้", en: "force needed", value: { from: 1, to: 754 }, prefix: "×", tone: "red" }],
      scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={60} rope={{}} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} />,
    },
  ],
  "18": [
    { at: 0, sfx: "snap", scene: () => <SpaceScene moonDir={-1} orbitDegPerSec={60} rope={{ snapAt: 8 }} header={{ th: "ผลลัพธ์ · หลุดวงโคจร", en: "result · escape" }} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} /> },
    { at: 0.5, sfx: "drone", scene: () => <RooftopScene hours={[23, 23]} pose="lookUp" starTwinkle /> },
  ],
  "19": [
    { at: 0, sfx: "chord", scene: () => <NeptuneScene spiral={false} /> },
    { at: 0.55, sfx: "rumble", scene: () => <NeptuneScene spiral /> },
  ],
  "20": [
    { at: 0, sfx: "chord", scene: () => <SpaceScene moonDir={1} orbitDegPerSec={12} header={{ th: "ความจริง · โคจรทางเดียวกับโลก", en: "reality · prograde orbit" }} footer={{ left: "ดวงจันทร์ · The Moon", right: "orbit diagram · not to scale" }} /> },
    { at: 0.5, scene: () => <RooftopScene hours={[23.5, 23.7]} moon={{ t: [0.6, 0.62], phase: [0.5, 0.5] }} pose="sit" rim={0.6} /> },
  ],
};
