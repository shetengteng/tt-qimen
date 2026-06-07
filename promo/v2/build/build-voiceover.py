#!/usr/bin/env python3
"""Generate aligned voice-over track for tt-qimen dev promo v1.5.

Pipeline:
  1. Read voice-segments.json
  2. For each segment, call edge-tts to generate seg/seg_NN.mp3
  3. Probe actual duration of each generated mp3 with ffprobe
  4. Build a silent base track of total duration, then overlay each segment
     at its specified startSec (using ffmpeg -filter_complex amix or adelay)
  5. Output build/voiceover-dev.mp3

Idempotent: skips TTS generation if seg/seg_NN.mp3 already exists.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SEG_DIR = ROOT / "seg"
MANIFEST = ROOT / "voice-segments.json"
OUT = ROOT / "voiceover-dev.mp3"

SEG_DIR.mkdir(parents=True, exist_ok=True)


def run(cmd, **kw):
    """Run a shell command, raise on failure, return stdout."""
    print(f"  $ {' '.join(str(c) for c in cmd)}", flush=True)
    result = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise SystemExit(f"command failed (exit {result.returncode}): {cmd}")
    return result.stdout.strip()


def ffprobe_duration(path: Path) -> float:
    """Return duration of a media file in seconds."""
    out = run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ])
    return float(out)


def generate_segment(seg, voice_main, voice_tech, rate_main, rate_tech):
    seg_id = seg["id"]
    text = seg["text"]
    is_tech = seg.get("voice") == "tech"
    voice = voice_tech if is_tech else voice_main
    rate = rate_tech if is_tech else rate_main
    out_mp3 = SEG_DIR / f"seg_{seg_id}.mp3"

    if out_mp3.exists() and out_mp3.stat().st_size > 1000:
        print(f"  [seg {seg_id}] cached  ({voice}) → {out_mp3.name}")
        return out_mp3

    print(f"  [seg {seg_id}] tts gen ({voice}, rate={rate})", flush=True)
    run([
        "edge-tts",
        f"--voice={voice}",
        f"--rate={rate}",
        f"--text={text}",
        f"--write-media={out_mp3}",
    ])
    return out_mp3


def main():
    print(f"== Loading manifest {MANIFEST.name} ==")
    with MANIFEST.open() as fh:
        m = json.load(fh)

    total = float(m["totalDurationSec"])
    voice_main = m["voiceMain"]
    voice_tech = m["voiceTech"]
    rate_main = m["rateMain"]
    rate_tech = m["rateTech"]
    segments = m["segments"]

    print(f"\n== Generating {len(segments)} TTS segments ==")
    seg_files = []
    for seg in segments:
        path = generate_segment(seg, voice_main, voice_tech, rate_main, rate_tech)
        dur = ffprobe_duration(path)
        seg_files.append({
            "id": seg["id"],
            "path": path,
            "start": float(seg["startSec"]),
            "duration": dur,
        })
        print(f"        actual duration: {dur:.2f}s   starts at {seg['startSec']:.1f}s")

    print(f"\n== Building aligned voiceover ({total}s total) ==")
    inputs = []
    filters = []
    for i, sf in enumerate(seg_files):
        inputs.extend(["-i", str(sf["path"])])
        start_ms = int(round(sf["start"] * 1000))
        filters.append(f"[{i}:a]adelay={start_ms}|{start_ms},apad[a{i}]")

    mix_inputs = "".join(f"[a{i}]" for i in range(len(seg_files)))
    filter_complex = (
        ";".join(filters)
        + f";{mix_inputs}amix=inputs={len(seg_files)}:duration=longest:normalize=0[mix]"
    )

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[mix]",
        "-t", str(total),
        "-c:a", "libmp3lame",
        "-q:a", "2",
        "-ar", "44100",
        "-ac", "2",
        str(OUT),
    ]
    run(cmd)
    final_dur = ffprobe_duration(OUT)
    print(f"\n== Done ==\n  output:   {OUT}")
    print(f"  duration: {final_dur:.2f}s")
    print(f"  size:     {OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
