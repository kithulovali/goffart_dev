from apis.auth import router as admin_router
from apis.articles import router as articles_router
from apis.profiles import router as profiles_router
from apis.projects import router as projects_router

__all__ = ["admin_router", "articles_router", "profiles_router", "projects_router"]
