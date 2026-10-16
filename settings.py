from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()
load_dotenv(".env.local", override=False)

DATABASE_URL = os.getenv("DATABASE_URL", "")
AUTH_TOKEN = os.getenv("TURBO_TOKEN") or ""
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN")


class Model(DeclarativeBase):
    pass

if DATABASE_URL.startswith("libsql://"):
    engine = create_engine(
        f"sqlite+libsql://{DATABASE_URL.removeprefix('libsql://')}?secure=true",
        connect_args={"auth_token": AUTH_TOKEN},
        echo=False,
    )
else:
   engine = create_engine(DATABASE_URL, echo=False)


sessio_local = sessionmaker(
    bind=engine,
    autoflush=False,
)


def get_db():
    db = sessio_local()

    try:
        yield db
    finally:
        db.close()
