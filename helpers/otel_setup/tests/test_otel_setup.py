from otel_setup import __version__, instrument_cloud_function


def test_version():
    assert __version__ == '0.1.0'


def test_setup_cloud_function():
    from functions_framework import create_app

    app = create_app(
        target='hello', source='tests/test_ff_app.py', signature_type='http'
    )
    assert None not in app.before_first_request_funcs
    instrument_cloud_function(app)
    print(app)
    assert None in app.before_request_funcs
    assert len(app.before_request_funcs[None]) == 1
