from models.project_model import Project
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 
from uuid import UUID

class ProjectRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self, *, project: Project) -> Project:
        self.session.add(project)
        self.session.flush()
        self.session.refresh(project)
        return project
    
    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> List[Project]:
        statement = select(Project).order_by(Project.title).offset(offset)
        if limit is not None:
            statement = statement.limit(limit)
        return list(self.session.scalars(statement).all())

    def get_by_public_id(self, public_id: UUID) -> Project | None:
        statement = select(Project).where(Project.public_id == public_id)
        return self.session.scalar(statement)
    
    def delete(self,project:Project) -> None:
        self.session.delete(project)
        self.session.flush()
    
    def update(self, *, project: Project, **values: str | None) -> Project:
        for field, value in values.items():
            if value is not None:
                setattr(project, field, value)
        self.session.flush()
        return project