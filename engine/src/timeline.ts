import shots from "@clip/shots.json";
import vo from "@clip/public/vo/vo.json";
import { FPS } from "./theme";

export const LINE_GAP_FRAMES = 6;
export const VO_LEAD_FRAMES = 3;

export interface ShotLine {
  id: string;
  subs: string[];
  say?: string;
  target?: number; // seconds; pin a line's length (e.g. to match a reference cut)
}

export interface ShotsFile {
  title: string;
  episode?: string;
  summary: string;
  voice?: string;
  style?: string;
  endCard?: { type: "simple" | "series"; seconds?: number };
  bgm?: { twistLine?: string };
  lines: ShotLine[];
}

export interface VoClip {
  id: string;
  file: string;
  duration: number;
}

export interface LineTiming {
  id: string;
  from: number;
  frames: number;
  voFile: string;
  subs: { text: string; from: number; frames: number }[];
}

export const SHOTS = shots as ShotsFile;
export const END_CARD_FRAMES = Math.round((SHOTS.endCard?.seconds ?? 3) * FPS);

const visibleLength = (s: string) => s.replace(/\{[yrR]:([^}]*)\}/g, "$1").replace(/\s/g, "").length;

// Subtitle chunks share a line's duration in proportion to their visible length
function splitSubs(subs: string[], frames: number): LineTiming["subs"] {
  const total = subs.reduce((n, s) => n + visibleLength(s), 0);
  let cursor = 0;
  return subs.map((text, i) => {
    const len = i === subs.length - 1 ? frames - cursor : Math.round((visibleLength(text) / total) * frames);
    const sub = { text, from: cursor, frames: len };
    cursor += len;
    return sub;
  });
}

export function buildTimeline(): { lines: LineTiming[]; totalFrames: number } {
  const durations = new Map((vo as VoClip[]).map((v) => [v.id, v]));
  let cursor = 0;
  const lines = SHOTS.lines.map((line) => {
    const clip = durations.get(line.id);
    if (!clip) throw new Error(`Missing VO for line ${line.id}; run scripts/tts/generate-vo.mjs`);
    const natural = Math.ceil(clip.duration * FPS) + VO_LEAD_FRAMES + LINE_GAP_FRAMES;
    // A pinned line keeps its exact length unless the VO overruns it
    const frames = line.target ? Math.max(Math.round(line.target * FPS), Math.ceil(clip.duration * FPS) + VO_LEAD_FRAMES) : natural;
    const timing: LineTiming = { id: line.id, from: cursor, frames, voFile: clip.file, subs: splitSubs(line.subs, frames) };
    cursor += frames;
    return timing;
  });
  return { lines, totalFrames: cursor + END_CARD_FRAMES };
}
