import type { ReactNode } from "react";
import type { HudSpec } from "./components/ui/HudCard";
import { WarRoomScene } from "./components/sets/WarRoom";
import { MapScene } from "./components/sets/MapScene";
import { PhoneScene } from "./components/sets/PhoneScene";
import { WastelandScene } from "./components/sets/Wasteland";
import { AtmosphereScene, DarkPlanetScene, RiceBowlScene } from "./components/sets/DisasterSets";
import { BarChartCard, ChecklistCard, CountCard, DuckIcon, EyeSlashIcon, MeterCard, QuoteCard, RouteCard, RuleCard, ThermoCard, TimePill } from "./components/ui/Cards";
import { COLORS } from "./theme";

export type SfxName = "whoosh" | "glitch" | "stamp" | "drone" | "tick" | "rev" | "draw" | "pop" | "thump" | "shimmer" | "boom" | "water" | "scratch" | "alarm" | "creak" | "snap" | "rumble" | "chord" | "sting";

export interface Cut {
  at: number; // start as a fraction of the line's duration
  scene: () => ReactNode;
  hud?: HudSpec[];
  sfx?: SfxName;
}

const SunIcon = (
  <g fill={COLORS.yellow}>
    <circle cx={22} cy={22} r={10} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={20.5} y={2} width={3} height={7} transform={`rotate(${i * 45} 22 22)`} />)}
  </g>
);
const BoltIcon = <path d="M 24 4 L 10 24 L 20 24 L 16 40 L 34 16 L 24 16 Z" fill={COLORS.red} />;

// Shot-for-shot with the reference (P18OWp6TMXk): one cut per VO line
export const STORYBOARD: Record<string, Cut[]> = {
  "01": [{ at: 0, sfx: "alarm", scene: () => <WarRoomScene /> }],
  "02": [{ at: 0, sfx: "thump", scene: () => <WarRoomScene pressAt={18} /> }],
  "03": [
    {
      at: 0,
      sfx: "pop",
      scene: () => (
        <>
          <WastelandScene variant="dusk" />
          <RuleCard index={1} th="เห็นแสงวาบ อย่ามอง" en="see a flash? don't look at it" icon={EyeSlashIcon} />
          <RuleCard index={2} th="หมอบทันที" en="duck and cover" icon={DuckIcon} top={250} delay={30} />
        </>
      ),
    },
  ],
  "04": [
    {
      at: 0,
      sfx: "whoosh",
      scene: () => (
        <>
          <MapScene counter={false} />
          <CountCard th="หัวรบที่ยิงออก" en="warheads launched" from={0} to={5000} unit="ลูก" red top={860} left={100} source="source: fas nuclear notebook · est. stockpile" />
        </>
      ),
    },
  ],
  "05": [
    {
      at: 0,
      sfx: "whoosh",
      scene: () => (
        <>
          <MapScene counter />
          <CountCard th="หัวรบทั่วโลก" en="worldwide" from={5000} to={11000} unit="ลูก" top={860} left={100} source="source: fas 2024 · ~12,100 warheads globally" />
        </>
      ),
    },
  ],
  "06": [
    {
      at: 0,
      sfx: "glitch",
      scene: () => (
        <>
          <PhoneScene mode="emp" deadAt={60} />
          <MeterCard th="โครงข่ายไฟฟ้า" en="power grid" from={100} to={0} icon={BoltIcon} red top={60} />
        </>
      ),
    },
  ],
  "07": [
    {
      at: 0,
      sfx: "boom",
      scene: () => (
        <>
          <WastelandScene variant="fireball" />
          <CountCard th="อุณหภูมิใจกลาง" en="fireball core" from={0} to={10000000} unit="°C" red top={110} source="sun surface ≈ 5,500 °C" />
        </>
      ),
    },
  ],
  "08": [
    {
      at: 0,
      sfx: "rumble",
      scene: () => (
        <>
          <WastelandScene variant="fireball" />
          <TimePill th="ชั่วโมงที่ 1" en="hour 1" />
          <CountCard th="เสียชีวิตทันที" en="immediate deaths" from={0} to={270000000} unit="คน" red top={200} source="est. · global exchange scenario" />
        </>
      ),
    },
  ],
  "09": [{ at: 0, sfx: "drone", scene: () => <WastelandScene variant="ruins" moon /> }],
  "10": [{ at: 0, sfx: "rumble", scene: () => <AtmosphereScene /> }],
  "11": [
    {
      at: 0,
      sfx: "drone",
      scene: () => (
        <>
          <WastelandScene variant="ruins" />
          <MeterCard th="แสงแดดที่ถึงพื้น" en="sunlight at the ground" from={100} to={30} icon={SunIcon} top={110} />
        </>
      ),
    },
  ],
  "12": [
    {
      at: 0,
      sfx: "shimmer",
      scene: () => (
        <>
          <WastelandScene variant="snow" />
          <TimePill th="วันที่ 30" en="day 30" icon="sun" />
          <ThermoCard top={110} />
        </>
      ),
    },
  ],
  "13": [{ at: 0, sfx: "tick", scene: () => (<><WastelandScene variant="snow" /><BarChartCard shrink={false} /></>) }],
  "14": [{ at: 0, sfx: "draw", scene: () => (<><WastelandScene variant="snow" /><BarChartCard shrink /></>) }],
  "15": [{ at: 0, sfx: "stamp", scene: () => <RiceBowlScene /> }],
  "16": [
    {
      at: 0,
      sfx: "tick",
      scene: () => (
        <>
          <WastelandScene variant="ruins" />
          <ChecklistCard items={[["ไฟฟ้า", "electricity"], ["น้ำประปา", "tap water"], ["โรงพยาบาล", "hospitals"]]} />
        </>
      ),
    },
  ],
  "17": [
    {
      at: 0,
      sfx: "creak",
      scene: () => (
        <>
          <WastelandScene variant="survivors" />
          <TimePill th="วันที่ 1" en="day 1" icon="sun" />
          <RouteCard top={100} />
        </>
      ),
    },
  ],
  "18": [
    {
      at: 0,
      sfx: "boom",
      scene: () => (
        <>
          <DarkPlanetScene />
          <TimePill th="ภายใน 2 ปี" en="within 2 years" />
          <CountCard th="อดอาหาร" en="starvation" from={0} to={5000000000} unit="คน" red top={920} left={70} source="est. · nuclear winter famine models" />
        </>
      ),
    },
  ],
  "19": [{ at: 0, sfx: "rumble", scene: () => (<><WastelandScene variant="ruinsFire" /><CountCard th="อารยธรรมมนุษย์" en="civilisation" from={0} to={5000} unit="ปี" top={110} source="years of history" /></>) }],
  "20": [{ at: 0, sfx: "glitch", scene: () => <PhoneScene mode="cracked" /> }],
  "21": [{ at: 0, sfx: "chord", scene: () => (<><WastelandScene variant="ruinsFire" /><QuoteCard /></>) }],
  "22": [{ at: 0, sfx: "drone", scene: () => <DarkPlanetScene /> }],
};
