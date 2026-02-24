"""Generate SAM AI v3 app icons (192x192 and 512x512) for PWA / iPad."""

from PIL import Image, ImageDraw, ImageFont
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Colors matching the app's dark theme
BG_COLOR = (26, 26, 46)        # #1a1a2e
ACCENT = (233, 69, 96)         # #e94560
ACCENT_DIM = (180, 50, 72)     # dimmer accent for subtitle
TEXT_WHITE = (234, 234, 234)    # #eaeaea


def make_rounded_rect(size, radius, color):
    """Create an image with a rounded rectangle filled with color."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=color)
    return img


def draw_text_centered(draw, text, font, y, color, img_width):
    """Draw text horizontally centered at vertical position y."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (img_width - tw) // 2
    draw.text((x, y), text, fill=color, font=font)


def generate_icon(size):
    """Generate a clean SAM AI icon at the given size."""
    radius = int(size * 0.22)  # iOS-style rounded corners

    img = make_rounded_rect(size, radius, BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Try to use a bold system font; fall back to default
    main_font_size = int(size * 0.38)
    sub_font_size = int(size * 0.16)

    font_names = [
        "arialbd.ttf", "Arial Bold.ttf",
        "segoeui.ttf", "Segoe UI Bold",
        "calibrib.ttf",
        "arial.ttf", "DejaVuSans-Bold.ttf",
    ]
    main_font = None
    for fname in font_names:
        try:
            main_font = ImageFont.truetype(fname, main_font_size)
            break
        except (OSError, IOError):
            continue
    if main_font is None:
        main_font = ImageFont.load_default()

    sub_font = None
    for fname in font_names:
        try:
            sub_font = ImageFont.truetype(fname, sub_font_size)
            break
        except (OSError, IOError):
            continue
    if sub_font is None:
        sub_font = ImageFont.load_default()

    # Measure text
    sam_bbox = draw.textbbox((0, 0), "SAM", font=main_font)
    sam_h = sam_bbox[3] - sam_bbox[1]
    sam_w = sam_bbox[2] - sam_bbox[0]

    ai_bbox = draw.textbbox((0, 0), "AI", font=sub_font)
    ai_h = ai_bbox[3] - ai_bbox[1]

    # Layout: SAM text + gap + bar + gap + AI text
    bar_h = max(3, int(size * 0.025))
    gap = int(size * 0.04)
    total_h = sam_h + gap + bar_h + gap + ai_h
    start_y = (size - total_h) // 2

    # Draw "SAM"
    draw_text_centered(draw, "SAM", main_font, start_y, TEXT_WHITE, size)

    # Accent bar
    bar_w = int(sam_w * 0.9)
    bar_x = (size - bar_w) // 2
    bar_y = start_y + sam_h + gap
    draw.rounded_rectangle(
        [bar_x, bar_y, bar_x + bar_w, bar_y + bar_h],
        radius=bar_h // 2,
        fill=ACCENT,
    )

    # Draw "AI"
    ai_y = bar_y + bar_h + gap
    draw_text_centered(draw, "AI", sub_font, ai_y, ACCENT, size)

    # Convert to RGB (no alpha) for PNG compatibility
    out = Image.new('RGB', (size, size), BG_COLOR)
    out.paste(img, mask=img)
    return out


# Generate both sizes
for size, name in [(192, "icon-192.png"), (512, "icon-512.png")]:
    print(f"Generating {name}...")
    icon = generate_icon(size)
    path = os.path.join(SCRIPT_DIR, name)
    icon.save(path, "PNG")
    fsize = os.path.getsize(path)
    print(f"  Written: {path} ({fsize:,} bytes)")

# Also generate apple-touch-icon at 180x180
print("Generating apple-touch-icon-180.png...")
icon_180 = generate_icon(180)
path_180 = os.path.join(SCRIPT_DIR, "apple-touch-icon-180.png")
icon_180.save(path_180, "PNG")
print(f"  Written: {path_180} ({os.path.getsize(path_180):,} bytes)")

print("Done!")
