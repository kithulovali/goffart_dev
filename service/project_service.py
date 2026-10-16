from uuid import UUID
from collections.abc import Callable
from typing import TypeVar

from sqlalchemy.orm import Session

from models.project_model import Project
from repository.profile_repository import ProfileRepository
from repository.project_repository import ProjectRepository
from serializers.project_serializers import ProjectCreate, ProjectUpdate

T = TypeVar("T")


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ProjectRepository(db)
        self.profiles = ProfileRepository(db)

    def create(self, data: ProjectCreate) -> Project:
        values = data.model_dump(exclude={"profile_id"})
        values["banner"] = ""
        for field in ("description",):
            if values[field] is None:
                values[field] = ""
        profile = self.profiles.get_by_public_id(data.profile_id)
        if profile is None:
            raise LookupError("Profile not found")

        project = Project(**values, profile_id=profile.private_id)
        return self._commit(lambda: self.repository.create(project=project))

    def get(self, public_id: UUID) -> Project | None:
        return self.repository.get_by_public_id(public_id)

    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> list[Project]:
        return self.repository.get_all(offset=offset, limit=limit)

    def update_banner(self, public_id: UUID, banner_url: str) -> Project | None:
        project = self.get(public_id)
        if project is None:
            return None
        return self._commit(
            lambda: self.repository.update(project=project, banner=banner_url)
        )

    def update(self, public_id: UUID, data: ProjectUpdate) -> Project | None:
        project = self.get(public_id)
        if project is None:
            return None
        return self._commit(
            lambda: self.repository.update(
                project=project,
                **data.model_dump(exclude_unset=True),
            )
        )

    def delete(self, public_id: UUID) -> bool:
        project = self.get(public_id)
        if project is None:
            return False
        self._commit(lambda: self.repository.delete(project))
        return True

    def _commit(self, operation: Callable[[], T]) -> T:
        try:
            result = operation()
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise