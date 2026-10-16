from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ProjectCreate(BaseModel):
    
    title : str 
    description : Optional[str] = None
    tags : str 
    connect :str 
    contribute : str 
    profile_id: UUID
    
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
    
    model_config = ConfigDict(from_attributes=True)

class ProjectUpdate(BaseModel):
    
    title : Optional[str] = None
    description : Optional[str] = None
    tags : Optional[str] = None
    connect :Optional[str] = None 
    contribute : Optional[str]  = None