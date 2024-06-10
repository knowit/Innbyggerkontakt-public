"""Module that contains instrument_cloud_function."""
import os
import textwrap
from typing import TYPE_CHECKING

from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.cloud_trace_propagator import CloudTraceFormatPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.trace.span import Span
from requests import Response


if TYPE_CHECKING:
    from _typeshed.wsgi import WSGIEnvironment

    set_global_textmap(CloudTraceFormatPropagator())


def _request_hook(span: Span, environ: 'WSGIEnvironment'):
    if span and span.is_recording():
        function_target = os.environ.get('FUNCTION_TARGET', '-')
        span.update_name(function_target)
        span.set_attribute('WSGIEnvironment', str(environ))


def _response_hook(span: Span, status: str, response_headers: list):
    if span and span.is_recording():
        if status:
            span.set_attribute('resp_status', status)
        if response_headers:
            span.set_attribute('resp_headers', str(response_headers))


def _name_request_span(method: str, url: str) -> str:
    if method and url:
        return f'requests.{method}-{url}'
    else:
        return 'requests.UNKNOWN'


def _span_request_callback(span: Span, result: Response) -> None:
    if isinstance(result, Response):
        span.set_attribute(
            'result.text', textwrap.shorten(result.text, width=50, placeholder='…')
        )


def instrument_cloud_function(app):
    """Automatically instrument a cloud funtion with flask and requests instrumentation."""
    tracer_provider = TracerProvider()
    cloud_trace_exporter = CloudTraceSpanExporter()
    tracer_provider.add_span_processor(
        # BatchSpanProcessor buffers spans and sends them in batches in a
        # background thread. The default parameters are sensible, but can be
        # tweaked to optimize your performance
        BatchSpanProcessor(cloud_trace_exporter)
    )

    trace.set_tracer_provider(tracer_provider)

    FlaskInstrumentor().instrument_app(
        app=app, request_hook=_request_hook, response_hook=_response_hook
    )
    RequestsInstrumentor().instrument(
        name_callback=_name_request_span, span_callback=_span_request_callback
    )
