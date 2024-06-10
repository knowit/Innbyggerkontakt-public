"""Authorization"""
from fastapi.security.http import HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, Response
from fastapi.security import HTTPBearer

from innbyggerkontakt.firebase import get_user, User


oauth2_scheme = HTTPBearer()


def authorize(token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> User:
    """authorizes user"""
    try:
        return get_user(token.credentials)
    except Exception as exception:
        raise HTTPException(status_code=401, detail="Not authorized") from exception


def disable_cache(response: Response):
    """Set cache control header"""
    response.headers['Cache-Control'] = 'private, no-store'
