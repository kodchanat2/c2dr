// Gemini TTS adapter: text -> 24kHz mono WAV. Probes models in order until one works on the given key.
import { readFile, writeFile } from "node:fs/promises";

const API = "https://generativelanguage.googleapis.com/v1beta/models";
const SAMPLE_RATE = 24000;
export const MODEL_CANDIDATES = [
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
];

export async function loadEnv(path = ".env") {
  const text = await readFile(path, "utf8").catch(() => "");
  return Object.fromEntries(
    text.split("\n").filter((l) => /^\s*[A-Z_]+=/.test(l)).map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
}

export function wavFromPcm(pcm) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export async function synthesize({ apiKey, model, text, voice = "Kore", style }) {
  const prompt = style ? `${style}: ${text}` : text;
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${model}: HTTP ${res.status} ${body.error?.status ?? ""} ${body.error?.message ?? ""}`.trim());
  const data = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error(`${model}: no audio in response`);
  return wavFromPcm(Buffer.from(data, "base64"));
}

export async function pickModel(apiKey, preferred) {
  const order = preferred ? [preferred, ...MODEL_CANDIDATES.filter((m) => m !== preferred)] : MODEL_CANDIDATES;
  const errors = [];
  for (const model of order) {
    try {
      await synthesize({ apiKey, model, text: "ทดสอบ" });
      return { model, errors };
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error(`No TTS model usable with this key:\n${errors.join("\n")}`);
}

// CLI: node gemini-tts.mjs "<thai text>" out.wav
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = { ...(await loadEnv()), ...process.env };
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing in .env");
  const [text, out = "tts.wav"] = process.argv.slice(2);
  const { model, errors } = await pickModel(env.GEMINI_API_KEY, env.GEMINI_TTS_MODEL || undefined);
  errors.forEach((e) => console.error("skip:", e));
  console.error("using:", model);
  await writeFile(out, await synthesize({ apiKey: env.GEMINI_API_KEY, model, text }));
  console.error("wrote", out);
}
