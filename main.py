from settings import Model , engine 
from models.profile_model import Profile
from models.project_model import Project
from models.article_model import Article

Model.metadata.create_all(engine)