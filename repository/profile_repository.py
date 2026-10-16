from models.profile_model import Profile
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 
from uuid import UUID

class ProfileRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self, *, name: str, email: str, about: str | None = None,
               banner: str | None = None, contact: str | None = None) -> Profile:
        
        profile = Profile(
            name=name,
            email=email,
            about=about or "",
            banner=banner or "",
            contact=contact or "",
        )
        
        self.session.add(profile)
        self.session.flush()
        return profile 
    
    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> List[Profile]:
        statement = select(Profile).order_by(Profile.name).offset(offset)
        if limit is not None:
            statement = statement.limit(limit)
        return list(self.session.scalars(statement).all())

    def get_by_public_id(self, public_id: UUID) -> Profile | None:
        statement = select(Profile).where(Profile.public_id == public_id)
        return self.session.scalar(statement)
    
    def delete(self,profile:Profile) -> None:
        self.session.delete(profile)
        self.session.flush()
    
    def update(self, *, profile: Profile, **values: str | None) -> Profile:
        for field, value in values.items():
            if field == "Banner":
                field = "banner"
            if value is not None:
                setattr(profile, field, value)
        self.session.flush()
        return profile