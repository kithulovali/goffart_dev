from __future__ import annotations

from settings import Model
from models.utils import TimeStamp
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Uuid, Text, Integer, ForeignKey
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .project_model import Project
    from .profile_model import Profile


class Article(Model, TimeStamp):
    __tablename__ = "articles"

    public_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True, unique=True, default=uuid.uuid4)
    private_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    content: Mapped[str] = mapped_column(Text)
    author: Mapped[str] = mapped_column(String(128), nullable=False)
    banner: Mapped[str] = mapped_column(String(258))
    tags: Mapped[str] = mapped_column(String(256))
    connect: Mapped[str] = mapped_column(String(128))
    youtube_ref: Mapped[str] = mapped_column(String(128))
    download_count: Mapped[int] = mapped_column(Integer, default=0)

    profile_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.private_id"), nullable=False)

    profile: Mapped["Profile"] = relationship(back_populates="articles")
    project: Mapped["Project | None"] = relationship(
        back_populates="article",
        foreign_keys="Project.article_id",
        uselist=False,
    )
