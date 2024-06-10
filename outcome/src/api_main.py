"""Generate fastapi app for use by uvicorn."""
import json
import os

from api.routers import bulletin_router, mailjet_router
from api.routers.dependencies import headers
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    docs_url='/api/v1/outcome/docs',
    openapi_url='/api/v1/outcome/openapi.json',
    dependencies=[headers.cache],
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

app.include_router(mailjet_router.router, prefix='/api/v1/outcome/mailjet')
app.include_router(bulletin_router.router, prefix='/api/v1/outcome/bulletin')
