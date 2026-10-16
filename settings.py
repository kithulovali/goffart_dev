from sqlalchemy.orm import DeclarativeBase , sessionmaker
from sqlalchemy import create_engine 
from dotenv import load_dotenv 
import os 

load_dotenv()

DATABASE_URL=str(os.getenv("DATABASE_URL"))
AUTH_TOKEN=str(os.getenv("TURBO_TOKEN"))
class Model(DeclarativeBase):
    pass 

    """_summary_
    engine = create_engine(
    DATABASE_URL , 
    echo=True
)
    """


engine = create_engine(
    
        f"sqlite+libsql://{DATABASE_URL.removeprefix('libsql://')}?secure=true",
    connect_args={
        "auth_token": AUTH_TOKEN,
    },

    echo=False ,
    
)

sessio_local = sessionmaker(
    
    bind=engine ,
    autoflush=False 

    
)

def get_db():
    db = sessio_local()
    
    try :
        yield db 
    finally :
        
        db.close()
