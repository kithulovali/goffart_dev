from pydantic import BaseModel, ConfigDict
from typing import Optional 
from datetime import datetime 
from uuid import UUID

class ArticleCreate(BaseModel) :
    
    name : str
    content : Optional[str] = None  
    connect : str
    author  : str
    tags : Optional[str] = None
    youtube_ref : str
    profile_id: UUID
    
    
class ArticleRead(BaseModel):
    
    public_id : UUID
    name : str
    content :str
    connect : str
    author :str
    banner :str
    tags  : str
    youtube_ref :str
    created_at  : Optional[datetime] = None
    updated_at  : Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
    
class ArticleUpdate(BaseModel):
    

    name : Optional[str] = None
    content :Optional[str] = None
    connect : Optional[str] = None
    author :Optional[str] = None
    tags  : Optional[str] = None
    youtube_ref : Optional[str] = None