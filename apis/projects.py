from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from apis.auth import require_admin
from apis.utils import run_write
from serializers.project_serializers import ProjectCreate, ProjectRead, ProjectUpdate
from service.project_service import ProjectService
from service.banner_service import upload_banner
from settings import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])
Database = Annotated[Session, Depends(get_db)]


def project_create_form(
    title: Annotated[str, Form()],
    tags: Annotated[str, Form()],
    connect: Annotated[str, Form()],
    contribute: Annotated[str, Form()],
    profile_id: Annotated[UUID, Form()],
    description: Annotated[str | None, Form()] = None,
) -> ProjectCreate:
    return ProjectCreate(
        title=title,
        tags=tags,
        connect=connect,
        contribute=contribute,
        profile_id=profile_id,
        description=description,
    )


def project_update_form(
    title: Annotated[str | None, Form()] = None,
    description: Annotated[str | None, Form()] = None,
    tags: Annotated[str | None, Form()] = None,
    connect: Annotated[str | None, Form()] = None,
    contribute: Annotated[str | None, Form()] = None,
) -> ProjectUpdate:
    values = {
        field: value
        for field, value in {
            "title": title,
            "description": description,
            "tags": tags,
            "connect": connect,
            "contribute": contribute,
        }.items()
        if value is not None
    }
    return ProjectUpdate(**values)


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_project(
    data: Annotated[ProjectCreate, Depends(project_create_form)],
    db: Database,
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ProjectRead:
    service = ProjectService(db)
    try:
        project = run_write(db, lambda: service.create(data))
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    if banner is not None:
        banner_public_id = project.public_id
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="projects",
            public_id=banner_public_id,
        )
        project = run_write(
            db,
            lambda: service.update_banner(banner_public_id, banner_url),
        )
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project)


@router.get("", response_model=list[ProjectRead])
def list_projects(
    db: Database,
    offset: Annotated[
        int,
        Query(ge=0, description="Number of records to skip; use 0 to start at the first record."),
    ] = 0,
    limit: Annotated[int | None, Query(ge=1, le=100)] = None,
) -> list[ProjectRead]:
    return [
        ProjectRead.model_validate(project)
        for project in ProjectService(db).get_all(offset=offset, limit=limit)
    ]


@router.get("/{public_id}", response_model=ProjectRead)
def get_project(public_id: UUID, db: Database) -> ProjectRead:
    project = ProjectService(db).get(public_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project)


@router.patch(
    "/{public_id}",
    response_model=ProjectRead,
    dependencies=[Depends(require_admin)],
)
def update_project(
    public_id: UUID,
    db: Database,
    data: Annotated[ProjectUpdate, Depends(project_update_form)],
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ProjectRead:
    service = ProjectService(db)
    project = run_write(db, lambda: service.update(public_id, data))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if banner is not None:
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="projects",
            public_id=public_id,
        )
        project = run_write(
            db,
            lambda: service.update_banner(public_id, banner_url),
        )
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project)


@router.delete(
    "/{public_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_project(public_id: UUID, db: Database) -> Response:
    deleted = run_write(db, lambda: ProjectService(db).delete(public_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
