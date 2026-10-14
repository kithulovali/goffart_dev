from pydantic import BaseModel , EmailStr 
from uuid import UUID
from typing import Optional
from datetime import datetime 

class ProfileCreate(BaseModel):
    
    name : str 
    email : EmailStr
    about : Optional[str] = None
    Banner : Optional[str] = None
    contact : Optional[str] = None 
    
class ReadProfile(BaseModel):
    
    public_id  : UUID
    name : str 
    about : str 
    email : EmailStr
    Banner : str
    contact : str
    create_at : Optional[datetime] = None
    updated_at : Optional[datetime] = None 
    
    class config :
        from_attributes = True
    

    
class UpdateProfile(BaseModel):

    name : Optional[str] = None
    about : Optional[str] = None
    email : Optional[str] = None
    Banner : Optional[str] = None
    contact : Optional[str] = None