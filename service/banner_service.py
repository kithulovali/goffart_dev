import os
from typing import BinaryIO
from uuid import UUID

import cloudinary.uploader  # type: ignore[reportMissingTypeStubs]
from cloudinary.exceptions import Error as CloudinaryError  # type: ignore[reportMissingTypeStubs]
from fastapi import HTTPException, status

MAX_BANNER_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


def upload_banner(
    file: BinaryIO,
    *,
    content_type: str | None,
    resource: str,
    public_id: UUID,
) -> str:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG, WebP, or GIF image.",
        )

    position = file.tell()
    file.seek(0, 2)
    size = file.tell()
    file.seek(position)
    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )
    if size > MAX_BANNER_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Banner images must be 10 MB or smaller.",
        )

    if not os.getenv("CLOUDINARY_URL"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudinary is not configured. Set CLOUDINARY_URL.",
        )

    asset_id = f"banners/{resource}/{public_id}"
    try:
        result: dict[str, object] = cloudinary.uploader.upload(  # type: ignore[reportUnknownMemberType]
            file,
            resource_type="image",
            public_id=asset_id,
            overwrite=True,
            invalidate=True,
        )
    except CloudinaryError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cloudinary could not store the banner image.",
        ) from error

    secure_url = result.get("secure_url")
    if not isinstance(secure_url, str) or not secure_url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cloudinary did not return a secure image URL.",
        )
    return secure_url
