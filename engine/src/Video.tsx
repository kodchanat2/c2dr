import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile } from "remotion";
import { STORYBOARD } from "@clip/storyboard";
import { buildTimeline, END_CARD_FRAMES, SHOTS, VO_LEAD_FRAMES, type LineTiming } from "./timeline";
import { BrandOverlay } from "./components/ui/Brand";
import { HudCard } from "./components/ui/HudCard";
import { Subtitle } from "./components/ui/Subtitle";
import { SeriesEndCard } from "./components/sets/DisasterSets";
import { EndCardScene } from "./components/sets/MiscSets";
import { Grain, Vignette } from "./components/style/StyleKit";

const SFX_VOLUME = 0.22;
const BGM_VOLUME = 0.6;
const BGM_FADE_FRAMES = 20;

function fadeVolume(frame: number, length: number): number {
  return BGM_VOLUME * interpolate(frame, [0, BGM_FADE_FRAMES, length - BGM_FADE_FRAMES, length], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

const hasStatic = (name: string) => getStaticFiles().some((f) => f.name === name);

// Main bed until the twist line (if any), then a tension track; short crossfade between them.
// Missing files are skipped so a clip still renders before music is chosen.
function Bgm({ twistFrom, totalFrames }: { twistFrom?: number; totalFrames: number }) {
  const hasTwist = twistFrom !== undefined && hasStatic("bgm/twist.mp3");
  const mainLength = hasTwist ? twistFrom + BGM_FADE_FRAMES : totalFrames;
  const twistStart = hasTwist ? twistFrom - BGM_FADE_FRAMES : totalFrames;
  const twistLength = totalFrames - twistStart;
  return (
    <>
      {hasStatic("bgm/main.mp3") && (
        <Sequence durationInFrames={mainLength} layout="none">
          <Audio src={staticFile("bgm/main.mp3")} volume={(f) => fadeVolume(f, mainLength)} />
        </Sequence>
      )}
      {hasTwist && (
        <Sequence from={twistStart} durationInFrames={twistLength} layout="none">
          <Audio src={staticFile("bgm/twist.mp3")} volume={(f) => fadeVolume(f, twistLength)} />
        </Sequence>
      )}
    </>
  );
}

function Line({ line }: { line: LineTiming }) {
  const cuts = STORYBOARD[line.id] ?? [];
  return (
    <AbsoluteFill>
      {cuts.map((cut, i) => {
        const from = Math.round(cut.at * line.frames);
        const to = i + 1 < cuts.length ? Math.round(cuts[i + 1].at * line.frames) : line.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} name={`${line.id}${String.fromCharCode(97 + i)}`}>
            {cut.scene()}
            {cut.hud?.map((h, j) => <HudCard key={j} spec={h} index={j} />)}
            {cut.sfx && hasStatic(`sfx/${cut.sfx}.wav`) && <Audio src={staticFile(`sfx/${cut.sfx}.wav`)} volume={SFX_VOLUME} />}
          </Sequence>
        );
      })}
      {line.subs.map((s, i) => (
        <Sequence key={`s${i}`} from={s.from} durationInFrames={s.frames} layout="none">
          <Subtitle text={s.text} />
        </Sequence>
      ))}
      <Sequence from={VO_LEAD_FRAMES} layout="none">
        <Audio src={staticFile(`vo/${line.voFile}`)} />
      </Sequence>
    </AbsoluteFill>
  );
}

export function ReelVideo() {
  const { lines, totalFrames } = buildTimeline();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {lines.map((line) => (
        <Sequence key={line.id} from={line.from} durationInFrames={line.frames} name={`line ${line.id}`}>
          <Line line={line} />
        </Sequence>
      ))}
      <Sequence from={totalFrames - END_CARD_FRAMES} name="end card">
        {SHOTS.endCard?.type === "series" ? (
          <SeriesEndCard title={SHOTS.title} episode={SHOTS.episode ?? ""} question={SHOTS.summary} />
        ) : (
          <EndCardScene title={SHOTS.title} summary={SHOTS.summary} />
        )}
        {hasStatic("sfx/sting.wav") && <Audio src={staticFile("sfx/sting.wav")} volume={SFX_VOLUME} />}
      </Sequence>
      <Vignette strength={0.55} />
      <Grain opacity={0.08} />
      <Bgm twistFrom={lines.find((l) => l.id === SHOTS.bgm?.twistLine)?.from} totalFrames={totalFrames} />
      <BrandOverlay />
    </AbsoluteFill>
  );
}
