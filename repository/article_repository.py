from models.article_model import Article 
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 
from uuid import UUID

class ArticleRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self ,*,article:Article) -> Article :
        
        self.session.add(article)
        self.session.flush()
        self.session.refresh(article)
        return article 
    
    def get_all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
    ) -> List[Article]:
        statement = select(Article).order_by(Article.name, Article.public_id).offset(offset)
        if limit is not None:
            statement = statement.limit(limit)
        return list(self.session.scalars(statement).all())

    def get_by_public_id(self, public_id: UUID) -> Article | None:
        statement = select(Article).where(Article.public_id == public_id)
        return self.session.scalar(statement)
    
    def delete(self,article:Article) -> None:
        self.session.delete(article)
        self.session.flush()
    
    def update(self, *, article: Article, **values: str | None) -> Article:
        for field, value in values.items():
            if value is not None:
                setattr(article, field, value)
        self.session.flush()
        return article