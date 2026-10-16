from settings import Model , engine 
from fastapi import FastAPI
from apis import articles_router, profiles_router, projects_router

Model.metadata.create_all(engine)

app = FastAPI(title="Goffart API")
app.include_router(profiles_router)
app.include_router(articles_router)
app.include_router(projects_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)