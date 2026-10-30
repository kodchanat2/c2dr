// Generate one VO clip per line of a shots.json in a single Live session, re-take lines whose pitch drifts,
// then trim silence, normalize loudness and speed up to reference pace.
// Usage: node scripts/tts/generate-vo.mjs <shots.json> <outDir> [--tempo 1.35] [--force]
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "./gemini-tts.mjs";
import { LiveSession } from "./gemini-live-tts.mjs";
import { medianF0 } from "./voice-qa.mjs";

const MAX_RETAKES = 3;
const MAX_F0_DRIFT = 0.12; // relative to the script-wide median pitch
const TRIM = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse";
const LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=7";
const MIN_TEMPO = 0.85;
const MAX_TEMPO = 1.5;
const TARGET_TAIL_S = 0.12; // breathing room before the next cut

export const stripMarkup = (s) => s.replace(/\{[yrR]:([^}]*)\}/g, "$1");
export const spokenText = (line) => line.say ?? line.subs.map(stripMarkup).join(" ");

const probeDuration = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// Live sometimes truncates a turn; anything faster than this is treated as a cut-off take
const MAX_CHARS_PER_S = 20;
const visibleChars = (line) => spokenText(line).replace(/\s/g, "").length;

async function take(session, line, file) {
  for (let attempt = 1; ; attempt++) {
    await writeFile(file, await session.say(spokenText(line)));
    const tooShort = probeDuration(file) < visibleChars(line) / MAX_CHARS_PER_S;
    if (!tooShort || attempt >= MAX_RETAKES) return medianF0(file);
    console.error(`${line.id} truncated take (${probeDuration(file).toFixed(2)}s), retrying`);
  }
}

async function main() {
  const [shotsPath, outDir, ...flags] = process.argv.slice(2);
  if (!shotsPath || !outDir) throw new Error("usage: generate-vo.mjs <shots.json> <outDir> [--tempo N] [--force]");
  const tempo = flags.includes("--tempo") ? Number(flags[flags.indexOf("--tempo") + 1]) : 1.35;
  const force = flags.includes("--force");
  const env = { ...(await loadEnv()), ...process.env };
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing in .env");

  const shots = JSON.parse(await readFile(shotsPath, "utf8"));
  await mkdir(outDir, { recursive: true });
  const rawOf = (line) => path.join(outDir, `${line.id}.raw.wav`);
  const session = await new LiveSession({ apiKey: env.GEMINI_API_KEY, voice: shots.voice, ...(shots.style && { style: shots.style }) }).open();
  const pitch = new Map();
  try {
    for (const line of shots.lines) {
      const raw = rawOf(line);
      pitch.set(line.id, force || !existsSync(raw) ? await take(session, line, raw) : await medianF0(raw));
      console.error(`${line.id} F0 ${pitch.get(line.id).toFixed(0)}Hz  ${spokenText(line)}`);
    }
    const ref = median([...pitch.values()]);
    console.error(`reference F0 ${ref.toFixed(0)}Hz`);
    for (const line of shots.lines) {
      for (let retake = 1; Math.abs(pitch.get(line.id) - ref) / ref > MAX_F0_DRIFT && retake <= MAX_RETAKES; retake++) {
        const candidate = `${rawOf(line)}.retake.wav`;
        const f0 = await take(session, line, candidate);
        console.error(`${line.id} retake ${retake}: F0 ${f0.toFixed(0)}Hz (was ${pitch.get(line.id).toFixed(0)})`);
        if (Math.abs(f0 - ref) < Math.abs(pitch.get(line.id) - ref)) {
          execFileSync("mv", [candidate, rawOf(line)]);
          pitch.set(line.id, f0);
        }
      }
    }
  } finally {
    session.close();
  }

  const result = shots.lines.map((line) => {
    const out = path.join(outDir, `${line.id}.wav`);
    // With a per-line `target` (seconds), stretch the clip to fill it, e.g. to match a reference clip's cut timing
    let lineTempo = tempo;
    if (line.target) {
      const trimmed = path.join(outDir, `${line.id}.trim.wav`);
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", rawOf(line), "-af", TRIM, trimmed]);
      lineTempo = Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, probeDuration(trimmed) / (line.target - TARGET_TAIL_S)));
    }
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", rawOf(line), "-af", `${TRIM},${LOUDNORM},atempo=${lineTempo.toFixed(4)}`, "-ar", "24000", out]);
    return { id: line.id, file: path.basename(out), duration: Number(probeDuration(out).toFixed(3)), f0: Math.round(pitch.get(line.id)), tempo: Number(lineTempo.toFixed(3)) };
  });
  await writeFile(path.join(outDir, "vo.json"), JSON.stringify(result, null, 2));
  const f0s = result.map((r) => r.f0);
  console.error(`total ${result.reduce((s, r) => s + r.duration, 0).toFixed(1)}s, F0 range ${Math.min(...f0s)}–${Math.max(...f0s)}Hz`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
