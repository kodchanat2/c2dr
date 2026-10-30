// Gemini Live API as TTS: text -> 24kHz mono WAV. The system instruction carries the speaking style,
// so the style text is never spoken (unlike the generateContent TTS models).
// Reuse one LiveSession for every line of a script: separate sessions re-roll the delivery and the
// narrator audibly changes mid-clip (exp 01: median F0 drifted 110 Hz -> 165 Hz between lines).
import { writeFile } from "node:fs/promises";
import { loadEnv, wavFromPcm } from "./gemini-tts.mjs";

const WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
const DEFAULT_MODEL = "gemini-3.8-live";
const TIMEOUT_MS = 60000;
export const DEFAULT_STYLE =
  "You are a Thai voice-over artist for short vertical videos. Read each user message aloud in Thai exactly as written, word for word. " +
  "Do not add, answer, translate, or comment. Keep ONE consistent persona for every message: the same calm, low-pitched male documentary voice, " +
  "steady energy, steady pitch, medium-fast pace. Never become excited, high-pitched, or theatrical, even on dramatic lines.";

export class LiveSession {
  constructor({ apiKey, model = DEFAULT_MODEL, voice = "Charon", style = DEFAULT_STYLE }) {
    Object.assign(this, { apiKey, model, voice, style });
    this.ws = null;
    this.pending = null;
  }

  open() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?key=${this.apiKey}`);
      this.ws = ws;
      ws.onopen = () =>
        ws.send(JSON.stringify({
          setup: {
            model: `models/${this.model}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voice } } },
            },
            systemInstruction: { parts: [{ text: this.style }] },
          },
        }));
      ws.onerror = (e) => this.#fail(new Error(`${this.model}: websocket error ${e.message ?? ""}`), reject);
      ws.onclose = (e) => {
        if (e.code !== 1000 && e.code !== 1005) this.#fail(new Error(`${this.model}: closed ${e.code} ${e.reason}`), reject);
      };
      ws.onmessage = async (event) => {
        const raw = typeof event.data === "string" ? event.data : await event.data.text();
        const msg = JSON.parse(raw);
        if (msg.setupComplete) return resolve(this);
        this.#onServerContent(msg.serverContent);
      };
    });
  }

  say(text) {
    if (this.pending) return Promise.reject(new Error("LiveSession.say called while a turn is in progress"));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.#fail(new Error(`${this.model}: timeout`)), TIMEOUT_MS);
      this.pending = { chunks: [], resolve, reject, timer };
      this.ws.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text }] }], turnComplete: true } }));
    });
  }

  close() {
    this.ws?.close(1000);
  }

  #onServerContent(content) {
    const turn = this.pending;
    if (!content || !turn) return;
    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) turn.chunks.push(Buffer.from(part.inlineData.data, "base64"));
    }
    if (!content.turnComplete) return;
    clearTimeout(turn.timer);
    this.pending = null;
    if (!turn.chunks.length) return turn.reject(new Error(`${this.model}: no audio returned`));
    turn.resolve(wavFromPcm(Buffer.concat(turn.chunks)));
  }

  #fail(error, rejectOpen) {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(error);
      this.pending = null;
    }
    rejectOpen?.(error);
    this.ws?.close();
  }
}

export async function synthesizeLive(options) {
  const session = await new LiveSession(options).open();
  try {
    return await session.say(options.text);
  } finally {
    session.close();
  }
}

// CLI: node gemini-live-tts.mjs "<thai text>" out.wav [voice]
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = { ...(await loadEnv()), ...process.env };
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing in .env");
  const [text, out = "tts.wav", voice] = process.argv.slice(2);
  await writeFile(out, await synthesizeLive({ apiKey: env.GEMINI_API_KEY, text, voice }));
  console.error("wrote", out);
}
