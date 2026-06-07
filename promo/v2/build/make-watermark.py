#!/usr/bin/env python3
"""Generate a low-key transparent PNG watermark for the bottom-right corner.

Output: build/watermark.png (transparent PNG, 1080×40-ish)
Designed to be overlaid onto a 1920x1080 video at offset (W-w-24, H-h-18).

Run once. Re-run only if you change the disclaimer text or style.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "watermark.png"

TEXT = "本项目为开源技术示例 · 文化体验用途 · 不构成任何专业建议"
FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_INDEX = 0  # Standard / W3
FONT_SIZE = 22
PAD_X = 14
PAD_Y = 8
TEXT_RGBA = (255, 255, 255, 165)   # white at ~65% alpha
STROKE_RGBA = (0, 0, 0, 140)        # black halo for legibility on light bg
STROKE_W = 1


def main():
    font = ImageFont.truetype(FONT_PATH, FONT_SIZE, index=FONT_INDEX)
    probe = Image.new("RGBA", (4, 4))
    bbox = ImageDraw.Draw(probe).textbbox((0, 0), TEXT, font=font, stroke_width=STROKE_W)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    width = text_w + PAD_X * 2
    height = text_h + PAD_Y * 2

    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.text(
        (PAD_X - bbox[0], PAD_Y - bbox[1]),
        TEXT,
        font=font,
        fill=TEXT_RGBA,
        stroke_width=STROKE_W,
        stroke_fill=STROKE_RGBA,
    )

    img.save(OUT, "PNG")
    print(f"wrote {OUT} ({width}x{height})")


if __name__ == "__main__":
    main()
