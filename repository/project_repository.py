from models.project_model import Project
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 

class ProjectRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self ,title:str ,description :str  ,banner:str, tags:str ,
               connect:str ,contribute:str) -> Project :
        
        project = Project(description=description , title=title,
                          tags=tags ,banner=banner,
                        connect=connect,contribute=contribute)
        
        self.session.add(project)
        self.session.flush()
        return project
    
    def get_all(self,*,offset:int =0 , limit:int = 100 ) -> List[Project]:
        statement = select(Project).order_by(Project.title).offset(offset).limit(limit)
        return list(self.session.scalars(statement).all())
    
    def delete(self,project:Project) -> Project | None:
        self.session.delete(project)
        self.session.flush()
    
    def update(self , *, project : Project ,title : str |None , description : str | None ,banner : str | None ,
               tags : str | None , connect : str | None , contribute : str | None ) -> Project | None :
        
        if title is not None :
            Project.title = title 
        if description is not None :
            Project.description = description 
        if banner is not None :
            Project.banner = banner 
        if tags is not None :
            Project.tags = tags 
        if connect is not None :
            Project.connect = connect 
        if contribute is not None :
            Project.contribute = contribute
        
        self.session.flush()
        return project