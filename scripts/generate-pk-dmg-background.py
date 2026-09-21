#!/usr/bin/env python3
"""Generate the animated Finder background used by the MonoCode PK DMG."""

from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


WIDTH, HEIGHT = 660, 400
FRAMES = 64


def font(size: int):
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                pass
    return ImageFont.load_default()


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def draw_glow(canvas: Image.Image, point: tuple[float, float], color: tuple[int, int, int], radius: int = 24):
    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    x, y = point
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, 150))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(radius // 2)))


def main() -> None:
    output = Path(sys.argv[1] if len(sys.argv) > 1 else "packaging/dmg-background.gif")
    output.parent.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    title_font = font(24)
    small_font = font(12)

    for index in range(FRAMES):
        t = index / FRAMES
        phase = 2 * math.pi * t
        image = Image.new("RGBA", (WIDTH, HEIGHT), (13, 16, 27, 255))
        draw = ImageDraw.Draw(image)

        # Subtle technical grid, kept away from both Finder icon zones.
        for x in range(20, WIDTH, 40):
            draw.line((x, 24, x, HEIGHT - 24), fill=(31, 39, 58, 100), width=1)
        for y in range(24, HEIGHT - 24, 40):
            draw.line((20, y, WIDTH - 20, y), fill=(31, 39, 58, 100), width=1)

        accent = (113, 231, 184)
        accent_soft = (61, 139, 132)
        start = (238, 170)
        end = (422, 170)
        pulse = 0.5 + 0.5 * math.sin(phase)

        # Finder renders icon names in black. These two quiet cards preserve
        # contrast without competing with the native app and Applications
        # icons placed above them by create-dmg.
        # Finder places the label directly below a 128 px icon centered at y=170.
        # Keep the contrast cards behind that label band, not down in the fade.
        draw.rounded_rectangle((92, 220, 268, 284), radius=12, fill=(190, 204, 216, 225), outline=(113, 231, 184, 110), width=1)
        draw.rounded_rectangle((392, 220, 568, 284), radius=12, fill=(190, 204, 216, 225), outline=(113, 231, 184, 110), width=1)

        # The real Finder icons sit at (180,170) and (480,170). Keep their
        # 128 px zones dark and use this path only as a visual instruction.
        for dot in range(14):
            x = lerp(start[0], end[0], dot / 13)
            draw.ellipse((x - 2, start[1] - 2, x + 2, start[1] + 2), fill=(*accent_soft, 170))

        progress = min(1.0, max(0.0, (t - 0.06) / 0.66))
        current = (lerp(start[0], end[0], progress), start[1] + 5 * math.sin(phase * 2))
        glow_color = tuple(int(lerp(accent_soft[i], accent[i], 0.55 + 0.35 * pulse)) for i in range(3))
        draw_glow(image, current, glow_color, 30)
        draw = ImageDraw.Draw(image)
        if progress > 0:
            points = [(lerp(start[0], end[0], i / 36), start[1]) for i in range(37) if i / 36 <= progress]
            if len(points) > 1:
                draw.line(points, fill=(*accent, 220), width=3)
        draw.ellipse((current[0] - 7, current[1] - 7, current[0] + 7, current[1] + 7), fill=(*accent, 235))

        # Lower brand trace and copy.
        baseline = HEIGHT - 66
        for x in range(86, WIDTH - 86, 18):
            draw.line((x, baseline, x + 8, baseline), fill=(48, 75, 91, 180), width=2)
        trace = int((WIDTH - 172) * (0.5 + 0.5 * math.sin(phase - math.pi / 2)))
        draw.line((86, baseline, 86 + trace, baseline), fill=(*accent, 190), width=2)
        draw.text((WIDTH // 2, 44), "MonoCode PK", fill=(235, 242, 250), font=title_font, anchor="ma")
        draw.text((WIDTH // 2, 76), "Drag the app to Applications", fill=(153, 171, 193), font=small_font, anchor="ma")
        draw.text((WIDTH // 2, HEIGHT - 34), "PK  /  INSTALL  /  READY", fill=(109, 136, 157), font=small_font, anchor="mm")

        frames.append(image.convert("RGB"))

    palette = frames[0].quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    quantized = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    quantized[0].save(
        output,
        save_all=True,
        append_images=quantized[1:],
        duration=70,
        loop=0,
        optimize=True,
    )
    print(f"Generated {output} ({output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
