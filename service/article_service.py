from uuid import UUID
from collections.abc import Callable
from typing import TypeVar

from sqlalchemy.orm import Session

from models.article_model import Article
from repository.article_repository import ArticleRepository
from repository.profile_repository import ProfileRepository
from repository.project_repository import ProjectRepository
from serializers.article_serializers import ArticleCreate, ArticleUpdate

T = TypeVar("T")


class ArticleService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ArticleRepository(db)
        self.profiles = ProfileRepository(db)
        self.projects = ProjectRepository(db)

    def create(self, data: ArticleCreate) -> Article:
        values = data.model_dump(exclude={"profile_id", "project_id"})
        values["banner"] = ""
        for field in ("content", "tags"):
            if values[field] is None:
                values[field] = ""
        profile = self.profiles.get_by_public_id(data.profile_id)
        if profile is None:
            raise LookupError("Profile not found")

        article = Article(
            **values,
            profile_id=profile.private_id,
        )
        if data.project_id is not None:
            project = self.projects.get_by_public_id(data.project_id)
            if project is None:
                raise LookupError("Project not found")
            if project.article_id is not None:
                raise ValueError("Project is already linked to another article")
            article.project = project
        return self._commit(lambda: self.repository.create(article=article))

    def get(self, public_id: UUID) -> Article | None:
        return self.repository.get_by_public_id(public_id)

    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> list[Article]:
        return self.repository.get_all(offset=offset, limit=limit)

    def update_banner(self, public_id: UUID, banner_url: str) -> Article | None:
        article = self.get(public_id)
        if article is None:
            return None
        return self._commit(
            lambda: self.repository.update(article=article, banner=banner_url)
        )

    def update(self, public_id: UUID, data: ArticleUpdate) -> Article | None:
        article = self.get(public_id)
        if article is None:
            return None

        values = data.model_dump(exclude_unset=True)
        values.pop("profile_id", None)
        if "project_id" in values:
            project_id = values.pop("project_id")
            if project_id is None:
                article.project = None
            else:
                project = self.projects.get_by_public_id(project_id)
                if project is None:
                    raise LookupError("Project not found")
                if project.article_id not in (None, article.private_id):
                    raise ValueError("Project is already linked to another article")
                article.project = project
        return self._commit(
            lambda: self.repository.update(article=article, **values)
        )

    def delete(self, public_id: UUID) -> bool:
        article = self.get(public_id)
        if article is None:
            return False
        if article.project is not None:
            article.project.article = None
        self._commit(lambda: self.repository.delete(article))
        return True

    def _commit(self, operation: Callable[[], T]) -> T:
        try:
            result = operation()
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise
