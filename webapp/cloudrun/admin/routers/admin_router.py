"""Admin router"""
from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from firebase_admin.auth import UserNotFoundError
from innbyggerkontakt.firebase.user import User
from services.firebase_admin_service import FireBaseAdminService
from routers.dependencies import authorize
from models.user_model import UserData, UserDataListWrapper


router = APIRouter()


@router.get('/listUsers/', response_model=List[UserData], deprecated=True)
def get_list_of_users(user: User = Depends(authorize)):
    """Gets list of users"""
    firebase_admin_service = FireBaseAdminService(user)
    return firebase_admin_service.list_users()


@router.get('/users', response_model=UserDataListWrapper)
def get_organization_users(user: User = Depends(authorize)):
    """Gets list of users from organization"""
    firebase_admin_service = FireBaseAdminService(user)
    return UserDataListWrapper(users=firebase_admin_service.list_users())


@router.get('/users/{user_id}', response_model=UserData)
def get_organization_user(user_id: str, user: User = Depends(authorize)):
    """Gets a specific user from an organization"""
    firebase_admin_service = FireBaseAdminService(user)
    return firebase_admin_service.get_user(user_id)


@router.delete('/users/{user_id}')
def delete_user(user_id: str, user: User = Depends(authorize)):
    """Delete user"""
    firebase_admin_service = FireBaseAdminService(user)
    return firebase_admin_service.delete_users([user_id])


def user_not_found_error_handler(exc: UserNotFoundError):
    """Handle user not found from firebase"""
    return JSONResponse(
        status_code=404,
        content={"message": exc.default_message}
    )


# Create tuple to simplify use with fastapi exception handler
user_not_found_handler = (UserNotFoundError, user_not_found_error_handler)
