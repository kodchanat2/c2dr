# Visual style rules (learned in experiments 01–03)

## Depth and grade

- **Depth comes from blur, not detail.** Background planes get 5–14 px blur and a haze toward the sky colour; only the subject is sharp
- Use 3–5 planes (far, mid, props, floor/subject, foreground occluder)
- `Graded` (slightly desaturated, more contrast) on full-scene sets. Grain and vignette are applied globally

## Palette (`theme.ts`)

- Night navy `#141a2e`/`#1d2438`, blueprint `#7fa7d9`, cream card `#f4e9d4`
- Yellow `#f2c14e` = neutral highlight, red `#e5484d` = danger/twist
- Daytime skies are blue/cyan gradients; night is navy with lit windows

## Chrome

- A dark pill `HeaderChip` (`• หัวข้อ · หัวข้อย่อย` + EN caps) at top-left on diagram shots
- `FooterCaption` for a scientific/EN name and a tag ("not to scale")
- Cards: cream paper with a dark chip header, a big number, a small unit, and a source line. Numbers count up

## Subtitles

- Kanit 700, white with a thick dark stroke (needed over bright skies)
- Centred at y ≈ 62%
- Keep chunks short. Never let the subtitle sit on a face; move the character instead

## Characters, hands and props

- SVG `Person` is fine at mid-shot distance
- Close-ups of hands → `SkinnedHand` (real rigged mesh, toon shaded). Procedural hands look like Pinocchio and are banned
- Prefer 3D toon for objects that turn or need lit edges (phones, devices)
- Smoke and fire: `CelSmoke` (soft bands + blur) and radial `screen` glows. Don't use stacked blurred ellipses

## Motion

- Every shot moves: Ken Burns 1.00→1.06, parallax across planes, and count-ups on cards
- Reveal per shot in this order: card → number → detail
- Cuts every 2.5–4 s. The references' still-frame ratio is ~43%; ours matches at that pacing

## Audio

- VO ≈ −16 LUFS per line (`loudnorm` in `generate-vo.mjs`)
- BGM volume 0.6 with fades; SFX 0.22
- Final master −11 LUFS (`scripts/master.sh`)
