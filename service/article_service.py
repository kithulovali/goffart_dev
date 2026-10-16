from uuid import UUID
from collections.abc import Callable
from typing import TypeVar

from sqlalchemy.orm import Session

from models.article_model import Article
from repository.article_repository import ArticleRepository
from repository.profile_repository import ProfileRepository
from serializers.article_serializers import ArticleCreate, ArticleUpdate

T = TypeVar("T")


class ArticleService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ArticleRepository(db)
        self.profiles = ProfileRepository(db)

    def create(self, data: ArticleCreate) -> Article:
        values = data.model_dump(exclude={"profile_id"})
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
        return self._commit(
            lambda: self.repository.update(article=article, **values)
        )

    def delete(self, public_id: UUID) -> bool:
        article = self.get(public_id)
        if article is None:
            return False
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
