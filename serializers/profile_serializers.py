from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID
from typing import Optional
from datetime import datetime 

class ProfileCreate(BaseModel):
    
    name : str 
    email : EmailStr
    about : Optional[str] = None
    contact : Optional[str] = None 
    
class ReadProfile(BaseModel):
    
    public_id  : UUID
    name : str 
    about : str 
    email : EmailStr
    banner: str
    contact : str
    created_at : Optional[datetime] = None
    updated_at : Optional[datetime] = None 
    
    model_config = ConfigDict(from_attributes=True)
    

    
class UpdateProfile(BaseModel):

    name : Optional[str] = None
    about : Optional[str] = None
    email : Optional[EmailStr] = None
    contact : Optional[str] = None