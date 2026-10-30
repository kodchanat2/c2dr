// Voice consistency check: median pitch (F0) of a 16-bit mono WAV via autocorrelation.
import { readFile } from "node:fs/promises";

const FRAME_S = 0.04;
const HOP_S = 0.01;
const MIN_RMS = 0.02;
const MIN_HZ = 70;
const MAX_HZ = 350;
const VOICED_CORR = 0.4;

function readWav(buf) {
  const sampleRate = buf.readUInt32LE(24);
  const dataStart = buf.indexOf("data") + 8;
  const samples = new Float32Array((buf.length - dataStart) / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = buf.readInt16LE(dataStart + i * 2) / 32768;
  return { sampleRate, samples };
}

function frameF0(w, sr) {
  const mean = w.reduce((s, v) => s + v, 0) / w.length;
  const x = w.map((v) => v - mean);
  const rms = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);
  if (rms < MIN_RMS) return null;
  const corr = (lag) => {
    let s = 0;
    for (let i = 0; i + lag < x.length; i++) s += x[i] * x[i + lag];
    return s;
  };
  const c0 = corr(0);
  let best = 0;
  let bestLag = 0;
  for (let lag = Math.floor(sr / MAX_HZ); lag <= Math.ceil(sr / MIN_HZ); lag++) {
    const c = corr(lag);
    if (c > best) [best, bestLag] = [c, lag];
  }
  return best > VOICED_CORR * c0 ? sr / bestLag : null;
}

export async function medianF0(file) {
  const { sampleRate, samples } = readWav(await readFile(file));
  // Downsample to ~12 kHz for speed; pitch range is far below Nyquist
  const step = Math.max(1, Math.floor(sampleRate / 12000));
  const sr = sampleRate / step;
  const x = samples.filter((_, i) => i % step === 0);
  const frame = Math.floor(FRAME_S * sr);
  const hop = Math.floor(HOP_S * sr);
  const f0s = [];
  for (let i = 0; i + frame < x.length; i += hop) {
    const f = frameF0(x.subarray(i, i + frame), sr);
    if (f) f0s.push(f);
  }
  if (!f0s.length) return 0;
  f0s.sort((a, b) => a - b);
  return f0s[Math.floor(f0s.length / 2)];
}
