from pydantic import BaseModel 
from typing import Optional 
from datetime import datetime 
from uuid import UUID

class ArticleCreate(BaseModel) :
    
    name : str
    content : Optional[str] = None  
    connect : str
    author  : str
    banner  : Optional[str] = None 
    tags : Optional[str] = None
    youtube_ref : str
    
    
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
    
    class config :
        from_attributes = True
    
class ArticleUpdate(BaseModel):
    

    name : Optional[str] = None
    content :Optional[str] = None
    connect : Optional[str] = None
    author :Optional[str] = None
    banner :Optional[str] = None
    tags  : Optional[str] = None
    youtube_ref : Optional[str] = None