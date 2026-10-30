# Component library (`engine/src/components/`, imported as `@lib/components/...`)

All sets fill the 720×1280 frame and animate from `useCurrentFrame()` (relative to their cut).

## Sets (`sets/`)

| Component | Use | Key props |
|---|---|---|
| `RooftopScene` | Bangkok rooftop, 5 depth planes, sky by clock time, sun/moon on an arc, `Person` | `hours: [from,to]`, `moon {t, phase, r}`, `sun {t}`, `pose`, `expression`, `rim`, `eclipse`, `speedLines`, `wobble` |
| `SpaceScene` | Blueprint space diagram: Earth + orbiting Moon, grid, labels | `moonDir 1/-1`, `orbitDegPerSec`, `flipAt`, `trail`, `distance`, `rope {snapAt}`, `freezeAt`, `zoom`, `stamp`, `moonLabel`, `header {th,en}`, `footer {left,right}`, `overlay` |
| `MapScene` | World map (real coastlines) with missile/flow arcs and country pills | `counter` (adds return salvos). Copy it to make other flow maps (`PLACES`, `worldMap()` in `worldMap.ts`) |
| `WastelandScene` | City at dusk / fireball / ruins / ruins on fire / snow / survivors; cel smoke + falling particles | `variant`, `moon` |
| `RuinsBackdrop` | Blurred ruins backdrop for close-ups | `dark` |
| `WarRoomScene` | Red command room, DEFCON screen, hazard button, 3D pressing hand | `pressAt` (frame) |
| `PhoneScene` | Two 3D hands holding a 3D phone over a blurred backdrop | `mode: "emp"/"cracked"`, `deadAt` |
| `AtmosphereScene` | Atmosphere cross-section, smoke columns blocking the sun | none |
| `RiceBowlScene` | Top-down table, bowl, falling banknotes, 3D reaching hand | none |
| `DarkPlanetScene` | Dim Earth from space + particles | none |
| `BeachScene`, `NeptuneScene`, `PhaseStripScene`, `SplitMoonriseScene` | From the moon clip | see source |
| `EndCardScene` / `SeriesEndCard` | End cards (picked by `shots.json` `endCard.type`) | none |
| `SpeedMeter`, `EscapeBars` (`overlays.tsx`) | Overlay gauges | none |
| `CityLayer`, `RooftopProps`, `RoofFloor`, `ForegroundLeaves` (`city.tsx`) | Building blocks for new city scenes | `seed` keeps them deterministic |
| `MoonDisc`, `SunDisc`, `EarthGlobe`, `ArcArrow` (`celestial.tsx`) | Celestial primitives | `phase` 0..1 |

## Cat (`character/Cat.tsx`)

`<Cat pose coat x y scale facing rings phase />` is an SVG cel-shaded cat.

- Coats: `orange`, `grey`, `black`, `white`
- Poses: `sit`, `beatbox` (mouth on the beat + sound rings), `stare`, `loaf` (sleeping, zzz)
- `useBeat(phase)` gives a 0..1 pulse to sync props to the cats' beat

## Cat-clip sets (`sets/LivingRoom.tsx`, `sets/CatSets.tsx`)

- `LivingRoomScene cats camera(wide|close|table) dark cushion person candle shake`
- `Box` (open cardboard box; children render inside)
- `BoxOfCats count coats hopIndex`
- `CatMapScene focusThailand`
- `PowerCityScene sweep catWindows` (lights drain = blackout)
- `DoorstepScene`
- `CushionBlueprint`
- `VerdictScene`

## Character (`character/Person.tsx`)

`<Person pose expression x y scale rim facing />` is an SVG cel-shaded person (yellow shirt).

- Poses: `idle`, `lookUp`, `point`, `yawn`, `sit`, `shades`
- Expressions: `neutral`, `wow`, `smile`, `yawn`, `worried`
- The `sit` pose reads poorly; avoid it or improve it

## 3D toon kit (`toon/`)

- `ToonStage` (ThreeCanvas, transparent), `ToonLights`, `ToonMesh` (banded toon + ink hull; `soft` for low-contrast), `GEO`, `roundedSlab()`
- `SkinnedHand side pose position rotation scale sleeve forearm`
  - Poses in `SKIN_POSES`: `relaxed`, `grip`, `point`, `reach`, `phone`
  - Camera at +Z sees the **palm** by default; rotate Y by π to show the back
- `PhoneInHands mode deadAt`: phone screen drawn into a CanvasTexture each frame
- `CelSmoke columns blur sun`: painted-looking smoke. Columns are `{x, base, height, width, color, glow}` in world units (camera z 14: frame ≈ 5.7 × 10.2 units)

## UI (`ui/`)

- `Subtitle`: automatic, from `shots.json`
- `HudCard`: spec via a cut's `hud: [...]` (`label`, `en`, `value` string or `{from,to}`, `prefix`, `suffix`, `tone`)
- `Cards.tsx` (reference-style cards, placed as JSX inside `scene`): `CountCard`, `RuleCard` (+ `EyeSlashIcon`, `DuckIcon`), `TimePill`, `BarChartCard`, `ChecklistCard`, `ThermoCard`, `MeterCard`, `QuoteCard`, `RouteCard`, `CardShell`, `Chip`
- `BrandOverlay`: automatic (logo top-right, watermark)

## Style kit (`style/StyleKit.tsx`)

`Graded`, `DepthLayer` (blur + parallax + haze), `Grain` + `Vignette` (applied globally), `HeaderChip`, `FooterCaption`, `seeded()`.

## SFX names

`whoosh glitch stamp drone tick rev draw pop thump shimmer boom water scratch alarm creak snap rumble chord sting`
