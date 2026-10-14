from typing import Optional
from pydantic import BaseModel 
from uuid import UUID
from datetime import datetime

class ProjectCreate(BaseModel):
    
    title : str 
    description : Optional[str] = None
    banner : Optional[str] = None
    tags : str 
    connect :str 
    contribute : str 
    
class ProjectRead(BaseModel):
    
    public_id : UUID
    title : str 
    description : Optional[str] = None
    banner : Optional[str] = None
    tags : str 
    connect :str 
    contribute : str 
    created_at : Optional[datetime] = None 
    updated_at : Optional[datetime] = None 
    
    class config :
        from_attributes = True

class ProjectUpdate(BaseModel):
    
    title : Optional[str] 
    description : Optional[str] = None
    banner : Optional[str] = None
    tags : Optional[str] = None
    connect :Optional[str] = None 
    contribute : Optional[str]  = None
    created_at : Optional[datetime] = None 
    updated_at : Optional[datetime] = None 