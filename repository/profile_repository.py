from models.profile_model import Profile
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 

class ProfileRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self ,name:str ,email :str 
               ,about:str ,banner:str, contact:str ,
               ) -> Profile :
        
        profile = Profile(name=name , email=email,
                          about=about ,banner=banner,
                          contact=contact , )
        
        self.session.add(profile)
        self.session.flush()
        return profile 
    
    def get_all(self,*,offset:int =0 , limit:int = 100 ) -> List[Profile]:
        statement = select(Profile).order_by(Profile.name).offset(offset).limit(limit)
        return list(self.session.scalars(statement).all())
    
    def delete(self,profile:Profile) -> Profile | None:
        self.session.delete(profile)
        self.session.flush()
    
    def update(self , *, profile : Profile ,name : str |None , email : str | None ,banner : str | None ,
               about : str | None , contact : str | None  ) -> Profile | None :
        
        if name is not None :
            Profile.name = name 
        if email is not None :
            Profile.email = email
        if banner is not None :
            Profile.banner = banner 
        if about is not None :
            Profile.about = about
        if contact is not None :
            Profile.contact = contact

        
        self.session.flush()
        return profile