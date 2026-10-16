import os

from settings import Model, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apis import admin_router, articles_router, profiles_router, projects_router

Model.metadata.create_all(engine)

additional_frontend_origins = os.getenv("FRONTEND_ORIGINS", "")
app = FastAPI(title="Goffart API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://goffartdev-src.vercel.app",
        *[
            origin.strip().rstrip("/")
            for origin in additional_frontend_origins.split(",")
            if origin.strip()
        ],
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Authorization", "Content-Type"],
)
app.include_router(profiles_router)
app.include_router(articles_router)
app.include_router(projects_router)
app.include_router(admin_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)