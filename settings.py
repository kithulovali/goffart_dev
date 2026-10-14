from sqlalchemy.orm import DeclarativeBase , sessionmaker
from sqlalchemy import create_engine 
from dotenv import load_dotenv 
import os 

load_dotenv()

DATABASE_URL=str(os.getenv("DATABASE_URL"))
AUTH_TOKEN=str(os.getenv("Turbo_Token"))
class Model(DeclarativeBase):
    pass 

engine = create_engine(
    
        f"sqlite+libsql://{DATABASE_URL.removeprefix('libsql://')}?secure=true",
    connect_args={
        "auth_token": AUTH_TOKEN,
    },

    echo=True ,
    
)

sessio_local = sessionmaker(
    
    bind=engine ,
    autoflush=False 

    
)
