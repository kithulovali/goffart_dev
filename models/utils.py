from datetime import datetime 
from sqlalchemy import DateTime , func 
from sqlalchemy.orm import Mapped , mapped_column 

class TimeStamp :
    
    created_at : Mapped[datetime] = mapped_column(DateTime,server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        "update_at",
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )