"""otel_setup will help you instrument google cloud functions."""

from .main import instrument_cloud_function


__all__ = ['instrument_cloud_function']
__version__ = '0.1.0'
