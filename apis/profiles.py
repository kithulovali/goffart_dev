from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from pydantic import EmailStr
from sqlalchemy.orm import Session

from apis.auth import require_admin
from apis.utils import run_write
from serializers.profile_serializers import ProfileCreate, ReadProfile, UpdateProfile
from service.profile_service import ProfileService
from service.banner_service import upload_banner
from settings import get_db

router = APIRouter(prefix="/api/profiles", tags=["profiles"])
Database = Annotated[Session, Depends(get_db)]


def profile_create_form(
    name: Annotated[str, Form()],
    email: Annotated[EmailStr, Form()],
    about: Annotated[str | None, Form()] = None,
    contact: Annotated[str | None, Form()] = None,
) -> ProfileCreate:
    return ProfileCreate(name=name, email=email, about=about, contact=contact)


def profile_update_form(
    name: Annotated[str | None, Form()] = None,
    about: Annotated[str | None, Form()] = None,
    email: Annotated[EmailStr | None, Form()] = None,
    contact: Annotated[str | None, Form()] = None,
) -> UpdateProfile:
    values = {
        field: value
        for field, value in {
            "name": name,
            "about": about,
            "email": email,
            "contact": contact,
        }.items()
        if value is not None
    }
    return UpdateProfile(**values)


@router.post(
    "",
    response_model=ReadProfile,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_profile(
    data: Annotated[ProfileCreate, Depends(profile_create_form)],
    db: Database,
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ReadProfile:
    service = ProfileService(db)
    profile = run_write(db, lambda: service.create(data))
    if banner is not None:
        banner_public_id = profile.public_id
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="profiles",
            public_id=banner_public_id,
        )
        profile = run_write(
            db,
            lambda: service.update_banner(banner_public_id, banner_url),
        )
        if profile is None:
            raise HTTPException(status_code=404, detail="Profile not found")
    return ReadProfile.model_validate(profile)


@router.get("", response_model=list[ReadProfile])
def list_profiles(
    db: Database,
    offset: Annotated[
        int,
        Query(ge=0, description="Number of records to skip; use 0 to start at the first record."),
    ] = 0,
    limit: Annotated[int | None, Query(ge=1, le=100)] = None,
) -> list[ReadProfile]:
    return [
        ReadProfile.model_validate(profile)
        for profile in ProfileService(db).get_all(offset=offset, limit=limit)
    ]


@router.get("/{public_id}", response_model=ReadProfile)
def get_profile(public_id: UUID, db: Database) -> ReadProfile:
    profile = ProfileService(db).get(public_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ReadProfile.model_validate(profile)


@router.patch(
    "/{public_id}",
    response_model=ReadProfile,
    dependencies=[Depends(require_admin)],
)
def update_profile(
    public_id: UUID,
    db: Database,
    data: Annotated[UpdateProfile, Depends(profile_update_form)],
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ReadProfile:
    service = ProfileService(db)
    profile = run_write(db, lambda: service.update(public_id, data))
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    if banner is not None:
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="profiles",
            public_id=public_id,
        )
        profile = run_write(
            db,
            lambda: service.update_banner(public_id, banner_url),
        )
        if profile is None:
            raise HTTPException(status_code=404, detail="Profile not found")
    return ReadProfile.model_validate(profile)


@router.delete(
    "/{public_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_profile(public_id: UUID, db: Database) -> Response:
    deleted = run_write(db, lambda: ProfileService(db).delete(public_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
