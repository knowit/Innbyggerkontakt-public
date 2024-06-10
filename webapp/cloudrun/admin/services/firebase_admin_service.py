"""Fire base admin service"""
from typing import List

from fastapi.responses import JSONResponse
from firebase_admin import auth
from innbyggerkontakt.firebase import User, db

from models.user_model import UserData


class FireBaseAdminService:
    """Fire base admin service"""

    def __init__(self, user: User):
        self.organization_id = user.organization_id

    def get_user(self, user_id: str):
        """Get a specific user for the organization"""
        organization_users = self.list_firestore_users_for_org()
        if user_id in organization_users:
            return UserData(**auth.get_user(user_id).__getattribute__('_data'))
        return JSONResponse(
            status_code=403,
            content={
                'message': 'user not in your organization',
                'arguments': {'user_id': user_id},
            },
        )

    def list_users(self):
        # pylint: disable=unnecessary-dunder-call
        """List users"""
        user_ids_in_org = [
            auth.UidIdentifier(uid) for uid in self.list_firestore_users_for_org()
        ]
        user_result = auth.get_users(user_ids_in_org)
        return [
            UserData(**user.__getattribute__('_data')) for user in user_result.users
        ]

    def list_firestore_users_for_org(self):
        """Lists firestore users for org"""
        docs = (
            db.collection('organization')
            .document(self.organization_id)
            .collection('users')
            .get()
        )
        return [doc.id for doc in docs]

    def delete_users(self, users: List[str]):
        """Deletes users"""
        user_ids_in_org = self.list_firestore_users_for_org()
        valid_users_to_delete = [
            user_id for user_id in users if user_id in user_ids_in_org
        ]
        if not valid_users_to_delete:
            return JSONResponse(
                status_code=400,
                content={
                    'message': 'no valid users provided to delete',
                    'arguments': {'users': users},
                },
            )
        for user_id in valid_users_to_delete:
            db.collection('organization').document(self.organization_id).collection(
                'users'
            ).document(user_id).delete()
            db.collection('users').document(user_id).delete()
        auth.delete_users(valid_users_to_delete)
        return JSONResponse(status_code=200, content='OK')
