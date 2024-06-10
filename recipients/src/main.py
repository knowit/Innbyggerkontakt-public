"""Main file, start fastAPI."""

import uvicorn
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.cloud_trace_propagator import CloudTraceFormatPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from routers import freg_router, matrikkel_router, mml_router


# === Setup logging === ref: https://cloud.google.com/trace/docs/setup/python-ot
set_global_textmap(CloudTraceFormatPropagator())
tracer_provider = TracerProvider()
cloud_trace_exporter = CloudTraceSpanExporter()
tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))
trace.set_tracer_provider(tracer_provider)
tracer = trace.get_tracer(__name__)
app = FastAPI()
FastAPIInstrumentor.instrument_app(app)
# === Setup logging ===


app.include_router(freg_router.router, prefix='/freg', tags=['Freg'])
app.include_router(mml_router.router, prefix='/mml', tags=['mml'])
app.include_router(matrikkel_router.router, prefix='/matrikkel', tags=['Matrikkel'])

RequestsInstrumentor().instrument()  # Setup trace on all requests

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8080, reload=True)  # nosec
    #  - host=0.0.0.0 is required by cloud-run
