from __future__ import annotations

from settings import Model
from models.utils import TimeStamp
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Uuid
import uuid

if TYPE_CHECKING:
    from .article_model import Article
    from .project_model import Project


class Profile(Model, TimeStamp):
    __tablename__ = "profiles"

    public_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True, unique=True, default=uuid.uuid4)
    private_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(128))
    about: Mapped[str] = mapped_column(String(256))
    banner: Mapped[str] = mapped_column(String(256))
    contact: Mapped[str] = mapped_column(String(256))

    articles: Mapped[list["Article"]] = relationship(back_populates="profile")
    projects: Mapped[list["Project"]] = relationship(back_populates="profile")