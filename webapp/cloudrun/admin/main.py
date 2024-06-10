"""Firebase admin SDK main"""
import json
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import admin_router, dependencies


app = FastAPI(
    docs_url='/api/v1/admin/docs',
    openapi_url='/api/v1/admin/openapi.json',
    dependencies=[Depends(dependencies.disable_cache)],
)

origins = json.loads(os.getenv('CORS_ALLOWED_ORIGINS', '"[]"'))

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

app.add_exception_handler(*admin_router.user_not_found_handler)

app.include_router(admin_router.router, prefix='/api/v1/admin')
