from collections.abc import Callable
from typing import TypeVar

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

T = TypeVar("T")


def run_write(db: Session, operation: Callable[[], T]) -> T:
    try:
        return operation()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="The request conflicts with existing data or related records.",
        ) from error
