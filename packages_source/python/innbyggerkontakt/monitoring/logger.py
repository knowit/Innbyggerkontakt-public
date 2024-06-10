"""
logger.

WARNING: This class is being deprecated and will not work.
"""
import os
from dataclasses import dataclass
from enum import Enum
from functools import wraps


class ResourceTypes(str, Enum):
    """GCP resource types."""

    CLOUD_FUNCTION = 'cloud_function'
    CLOUD_RUN = 'cloud_run_revision'


@dataclass
class _DummyTracer:
    span_context: str = 'dummy_context'


class GcpLogger:
    """
    GCP logger.

    WARNING: This class is being deprecated and will not work.
    """

    def __init__(
        self,
        resource_type: str,
        bulletin_id: str = None,
        organization_id: str = None,
        span_context=None,
        headers=None,
        header=None,
        as_child=False,
        name=os.getenv('GCLOUD_PROJECT'),
    ):
        self.bulletin_id = bulletin_id
        self.organization_id = organization_id

        self.tracer = _DummyTracer()
        self.res = None
        self.cloud_logger = None
        self.span = 'my span'

    def log_message(
        self, type: str, *args, severity='INFO'
    ):  # pylint: disable=redefined-builtin
        """
        `log_message` will print to stdout.

        type: str, logging_v2.logging.Logger logging type, eks. "log_text|log_struct"
        *args: default args for logging type
        severity: str
        """
        print(type, args, severity)

    def log_text(self, text, severity='INFO'):
        """Log text to gcp."""
        print(text, severity)

    def get_trace_headers(self) -> dict:
        """Get trace headers as dict."""
        return {}

    def get_trace_string(self) -> str:
        """Get trace as string."""
        return self.tracer


def add_span(span_name: str = None):
    """WARNING: deprecated."""

    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            print(span_name)
            return func(self, *args, **kwargs)

        return wrapper

    return decorator
