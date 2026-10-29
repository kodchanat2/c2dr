"""Experimental: transcribe reference videos with word timestamps (not part of the skill)."""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

MODEL = "large-v3-turbo"


def transcribe(model: WhisperModel, video: Path, out_dir: Path) -> None:
    segments, info = model.transcribe(str(video), language="th", word_timestamps=True, vad_filter=True)
    rows = [
        {
            "start": round(s.start, 2),
            "end": round(s.end, 2),
            "text": s.text.strip(),
            "words": [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word} for w in s.words or []],
        }
        for s in segments
    ]
    (out_dir / f"{video.stem}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    (out_dir / f"{video.stem}.txt").write_text(
        "\n".join(f"[{r['start']:6.2f}-{r['end']:6.2f}] {r['text']}" for r in rows)
    )
    print(f"{video.stem}: {len(rows)} segments, {info.duration:.1f}s", flush=True)


def main(video_dir: str, out_dir: str) -> None:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    for video in sorted(Path(video_dir).glob("*.mp4")):
        if (out / f"{video.stem}.json").exists():
            continue
        transcribe(model, video, out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
