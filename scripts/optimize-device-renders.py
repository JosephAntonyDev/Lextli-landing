"""Convert the Blender PNG renders into the WebP assets used on the landing."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
for name in ("pixel-front", "pixel-back"):
    source = root / "public" / "device" / f"{name}.png"
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.save(destination, "WEBP", quality=90, method=6)
    # The editable .blend and generator reproduce these intermediates.
    source.unlink()
    print(f"{destination.name}: {destination.stat().st_size:,} bytes")
