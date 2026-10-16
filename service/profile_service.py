from uuid import UUID
from collections.abc import Callable
from typing import TypeVar

from sqlalchemy.orm import Session

from models.profile_model import Profile
from repository.profile_repository import ProfileRepository
from serializers.profile_serializers import ProfileCreate, UpdateProfile

T = TypeVar("T")


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ProfileRepository(db)

    def create(self, data: ProfileCreate) -> Profile:
        values = data.model_dump()
        values["banner"] = ""
        for field in ("about", "contact"):
            if values[field] is None:
                values[field] = ""
        return self._commit(lambda: self.repository.create(**values))

    def get(self, public_id: UUID) -> Profile | None:
        return self.repository.get_by_public_id(public_id)

    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> list[Profile]:
        return self.repository.get_all(offset=offset, limit=limit)

    def update_banner(self, public_id: UUID, banner_url: str) -> Profile | None:
        profile = self.get(public_id)
        if profile is None:
            return None
        return self._commit(
            lambda: self.repository.update(profile=profile, banner=banner_url)
        )

    def update(self, public_id: UUID, data: UpdateProfile) -> Profile | None:
        profile = self.get(public_id)
        if profile is None:
            return None
        return self._commit(
            lambda: self.repository.update(
                profile=profile,
                **data.model_dump(exclude_unset=True),
            )
        )

    def delete(self, public_id: UUID) -> bool:
        profile = self.get(public_id)
        if profile is None:
            return False
        self._commit(lambda: self.repository.delete(profile))
        return True

    def _commit(self, operation: Callable[[], T]) -> T:
        try:
            result = operation()
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise