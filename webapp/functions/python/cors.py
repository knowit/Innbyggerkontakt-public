"""Module to handle cors"""
import json
import os


def cors(func):
    """Handle cors OPTIONS requests."""

    def wrapper(request):
        """Wrap cors OPTIONS requests."""
        allowed_origins = json.loads(os.getenv('CORS'))
        allow_origin = None
        origin = request.headers.get('origin')
        if origin in allowed_origins:
            origin_index = allowed_origins.index(origin)
            allow_origin = allowed_origins[origin_index] if origin_index else None
        if request.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': allow_origin,
                'Access-Control-Allow-Methods': ['POST', 'GET'],
                'Access-Control-Allow-Headers': ['Authorization', 'Content-Type'],
                'Access-Control-Max-Age': '3600',
                'Access-Control-Allow-Credentials': 'true',
            }
            return ('', 204, headers)
        # Set CORS headers for main requests
        headers = {
            'Access-Control-Allow-Origin': allow_origin,
            'Access-Control-Allow-Credentials': 'true',
        }

        return (*func(request), headers)

    return wrapper
