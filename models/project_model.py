from settings import Model 
from models.utils import TimeStamp
from sqlalchemy.orm import Mapped , mapped_column , relationship
from sqlalchemy import String , Uuid , ForeignKey
import uuid
from typing import TYPE_CHECKING 

if TYPE_CHECKING :
    from .article_model import Article
    from .profile_model import Profile


class Project(Model , TimeStamp):
    
    __tablename__="projects"
    
    public_id : Mapped[uuid.UUID] = mapped_column(Uuid ,index=True, unique=True , default=uuid.uuid4)
    private_id : Mapped[uuid.UUID] = mapped_column(Uuid , unique=True ,primary_key=True , default=uuid.uuid4)
    title : Mapped[str] = mapped_column(String(128), nullable=False , unique=True) 
    description : Mapped[str] = mapped_column(String(256))
    banner : Mapped[str] = mapped_column(String(256))
    tags : Mapped[str] = mapped_column(String(256))
    connect : Mapped[str] = mapped_column(String(256))
    contribute : Mapped[str] = mapped_column(String(256))
    
    article_id : Mapped[uuid.UUID] = mapped_column(ForeignKey("articles.private_id"))
    profile_id : Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.private_id"))
    
    article : Mapped["Article"] = relationship(
        back_populates="project"
    )
    
    profile : Mapped["Profile"] = relationship(
            back_populates="projects"
        )
        