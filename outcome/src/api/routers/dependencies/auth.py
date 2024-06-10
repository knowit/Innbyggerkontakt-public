"""Authorization."""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from innbyggerkontakt import firebase


oauth2_scheme = HTTPBearer()


def authorize(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> firebase.User:
    """Authorize user."""
    try:
        return firebase.get_user(token.credentials)
    except Exception as exception:
        raise HTTPException(status_code=401, detail='Not authorized') from exception
