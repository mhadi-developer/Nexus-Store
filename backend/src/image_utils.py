import uuid
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

PACKAGE_DIR = Path(__file__).resolve().parent
PROFILE_PICS_DIR = PACKAGE_DIR / "media" / "profile_pics"


def process_image(content: bytes) -> str:
    try:
        with Image.open(BytesIO(content)) as original:
            image = ImageOps.exif_transpose(original)
            image = ImageOps.fit(
                image,
                (300, 300),
                method=Image.Resampling.LANCZOS,
            )
            if "A" in image.getbands() or "transparency" in image.info:
                rgba_image = image.convert("RGBA")
                background = Image.new("RGB", rgba_image.size, "white")
                background.paste(rgba_image, mask=rgba_image.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise ValueError("Upload a valid image file.") from exc

    filename = f"{uuid.uuid4().hex}.jpg"
    PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
    image.save(PROFILE_PICS_DIR / filename, "JPEG", quality=85, optimize=True)
    return filename


def delete_profile_image(filename: str | None) -> None:
    if filename is None or Path(filename).name != filename:
        return

    filepath = PROFILE_PICS_DIR / filename
    if filepath.exists():
        filepath.unlink()
            