from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, Response, UploadFile, status
from sqlalchemy.orm import Session

from apis.auth import require_admin
from apis.utils import run_write
from serializers.article_serializers import ArticleCreate, ArticleRead, ArticleUpdate
from service.article_service import ArticleService
from service.banner_service import upload_banner
from settings import get_db

router = APIRouter(prefix="/api/articles", tags=["articles"])
Database = Annotated[Session, Depends(get_db)]


def article_create_form(
    name: Annotated[str, Form()],
    connect: Annotated[str, Form()],
    author: Annotated[str, Form()],
    youtube_ref: Annotated[str, Form()],
    profile_id: Annotated[UUID, Form()],
    project_id: Annotated[str | None, Form()] = None,
    content: Annotated[str | None, Form()] = None,
    tags: Annotated[str | None, Form()] = None,
) -> ArticleCreate:
    return ArticleCreate(
        name=name,
        connect=connect,
        author=author,
        youtube_ref=youtube_ref,
        profile_id=profile_id,
        project_id=project_id or None,
        content=content,
        tags=tags,
    )


async def article_update_form(
    request: Request,
    name: Annotated[str | None, Form()] = None,
    content: Annotated[str | None, Form()] = None,
    connect: Annotated[str | None, Form()] = None,
    author: Annotated[str | None, Form()] = None,
    tags: Annotated[str | None, Form()] = None,
    youtube_ref: Annotated[str | None, Form()] = None,
    project_id: Annotated[str | None, Form()] = None,
) -> ArticleUpdate:
    values = {
        field: value
        for field, value in {
            "name": name,
            "content": content,
            "connect": connect,
            "author": author,
            "tags": tags,
            "youtube_ref": youtube_ref,
        }.items()
        if value is not None
    }
    if "project_id" in await request.form():
        values["project_id"] = project_id or None
    return ArticleUpdate(**values)


@router.post(
    "",
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_article(
    data: Annotated[ArticleCreate, Depends(article_create_form)],
    db: Database,
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ArticleRead:
    service = ArticleService(db)
    try:
        article = run_write(db, lambda: service.create(data))
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if banner is not None:
        banner_public_id = article.public_id
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="articles",
            public_id=banner_public_id,
        )
        article = run_write(
            db,
            lambda: service.update_banner(banner_public_id, banner_url),
        )
        if article is None:
            raise HTTPException(status_code=404, detail="Article not found")
    return ArticleRead.model_validate(article)


@router.get("", response_model=list[ArticleRead])
def list_articles(
    db: Database,
    offset: Annotated[
        int,
        Query(ge=0, description="Number of records to skip; use 0 to start at the first record."),
    ] = 0,
    limit: Annotated[int | None, Query(ge=1, le=100)] = None,
) -> list[ArticleRead]:
    return [
        ArticleRead.model_validate(article)
        for article in ArticleService(db).get_all(offset=offset, limit=limit)
    ]


@router.get("/{public_id}", response_model=ArticleRead)
def get_article(public_id: UUID, db: Database) -> ArticleRead:
    article = ArticleService(db).get(public_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleRead.model_validate(article)


@router.patch(
    "/{public_id}",
    response_model=ArticleRead,
    dependencies=[Depends(require_admin)],
)
def update_article(
    public_id: UUID,
    db: Database,
    data: Annotated[ArticleUpdate, Depends(article_update_form)],
    banner: Annotated[
        UploadFile | None,
        File(description="Optional JPEG, PNG, WebP, or GIF banner image"),
    ] = None,
) -> ArticleRead:
    service = ArticleService(db)
    try:
        article = run_write(db, lambda: service.update(public_id, data))
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    if banner is not None:
        banner_url = upload_banner(
            banner.file,
            content_type=banner.content_type,
            resource="articles",
            public_id=public_id,
        )
        article = run_write(
            db,
            lambda: service.update_banner(public_id, banner_url),
        )
        if article is None:
            raise HTTPException(status_code=404, detail="Article not found")
    return ArticleRead.model_validate(article)


@router.delete(
    "/{public_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_article(public_id: UUID, db: Database) -> Response:
    deleted = run_write(db, lambda: ArticleService(db).delete(public_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Article not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
