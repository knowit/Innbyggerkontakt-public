"""Authenticate user against firebase authentication."""
import os
from functools import wraps

import firebase_admin
from firebase_admin import auth, firestore

from libs.firebase.user import User


FIREBASE = None

if not FIREBASE:
    cred = firebase_admin.credentials.ApplicationDefault()
    FIREBASE = firebase_admin.initialize_app(
        cred,
        {
            'projectId': os.getenv('GCP_PROJECT'),
        },
    )


db = firestore.client()


class UserNotFoundError(Exception):
    """User not found in the firestore "users" collection."""


class NotPartOfOrganizationError(Exception):
    """Users orgId is null."""


def get_user(token: str) -> User:
    """
    A document with the users id must exist under the "users" collection in firestore.

    token: str - firebase token.

    Return: innbyggerkontakt.firebase.user.User.
    """
    decoded_token = auth.verify_id_token(token, check_revoked=True)
    uid = decoded_token['uid']
    docs = db.collection('users').document(uid).get()
    if not docs:
        raise UserNotFoundError
    data = docs.to_dict()
    org_id = data.get('orgId')
    if not org_id:
        raise NotPartOfOrganizationError
    org_user = (
        db.collection('organization')
        .document(org_id)
        .collection('users')
        .document(uid)
        .get()
        .to_dict()
    )
    return User(
        user_id=uid, organization_id=data['orgId'], organization_role=org_user['rolle']
    )


def authenticate(get_user_as_kwarg=None):  # noqa: CCR001
    """Decorator to authenticate users for http cloud functions."""

    def decorator(func):
        @wraps(func)
        def wrapper(request):
            try:
                user = get_user(request.headers['Authorization'].replace('Bearer ', ''))
            except auth.ExpiredIdTokenError:
                return 'Expired token', 401
            except auth.RevokedIdTokenError:
                return 'Revoked token', 401
            except auth.InvalidIdTokenError:
                return 'Invalid Credentials', 401
            except UserNotFoundError:
                return 'User not found', 404
            if get_user_as_kwarg:
                return func(request, **{get_user_as_kwarg: user})
            return func(request)

        return wrapper

    return decorator
