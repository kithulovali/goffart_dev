from models.article_model import Article 
from sqlalchemy.orm import Session 
from sqlalchemy import select
from typing import List 

class ArticleRepository :
    
    def __init__(self , session : Session):
        self.session = session 
        
    def create(self ,name:str ,content :str 
               ,auther:str ,banner:str, tags:str ,
               connect:str ,youtube_ref:str) -> Article :
        
        article = Article(name=name , content=content,
                          auther=auther ,banner=banner,
                          tags=tags , connect=connect,youtube_ref=youtube_ref)
        
        self.session.add(article)
        self.session.flush()
        return article 
    
    def get_all(self,*,offset:int =0 , limit:int = 100 ) -> List[Article]:
        statement = select(Article).order_by(Article.name).offset(offset).limit(limit)
        return list(self.session.scalars(statement).all())
    
    def delete(self,article:Article) -> Article | None:
        self.session.delete(article)
        self.session.flush()
    
    def update(self , *, article : Article ,name : str |None , content : str | None ,banner : str | None ,
               tags : str | None , connect : str | None , youtube_ref : str | None ) -> Article | None :
        
        if name is not None :
            Article.name = name 
        if content is not None :
            Article.content = content 
        if banner is not None :
            Article.banner = banner 
        if tags is not None :
            Article.tags = tags 
        if connect is not None :
            Article.connect = connect 
        if youtube_ref is not None :
            Article.youtube_ref = youtube_ref 
        
        self.session.flush()
        return article 