import hmac

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from settings import ADMIN_API_TOKEN

bearer_scheme = HTTPBearer(auto_error=False)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> None:
    if not ADMIN_API_TOKEN or len(ADMIN_API_TOKEN) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication must be configured with a token of at least 32 characters.",
        )
    if credentials is None or not hmac.compare_digest(
        credentials.credentials,
        ADMIN_API_TOKEN,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid admin credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/verify", dependencies=[Depends(require_admin)])
def verify_admin() -> dict[str, bool]:
    return {"authenticated": True}
