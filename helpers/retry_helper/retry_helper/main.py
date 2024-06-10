"""Module that contains the 'retry' decorator."""
from datetime import datetime, timezone
from functools import wraps

from cloudevents.http import CloudEvent
from dateutil import parser


def retry(max_age_ms: int):
    """
    Create a decorator that runs a function iff the max time limit is not yet met.

    Args:
        max_age_ms: the max time limit, measured in milliseconds
    Returns:
        A decorator
    """

    def decorator(func):
        @wraps(func)
        def wrapper(cloud_event):
            """Call 'inner_retry' with the wrapped function."""
            return inner_retry(max_age_ms, func, cloud_event)

        return wrapper

    return decorator


def inner_retry(max_age_ms, func, cloud_event: CloudEvent):
    """
    Run the function, func, iff the cloud event is within allowed retry time.

    This is an inner method for the retry decorator.

    Args:
        max_age_ms: the time limit, measured in milliseconds
        func: the function to run
    Returns:
        The result of running the function, or "Timeout" if the time limit was met
    """
    now = datetime.now(timezone.utc)

    timestamp = cloud_event.get('time')
    event_time = parser.parse(timestamp)

    current_age_seconds = (now - event_time).total_seconds()
    current_age_ms = current_age_seconds * 1000

    event_id = cloud_event.get('id')

    if current_age_ms < max_age_ms:
        try:
            return func(cloud_event)
        except Exception as e:
            print(
                f'Function with cloud event {event_id} encountered an error while within allowed retry time. (event age {current_age_ms:.2f}ms of max age {max_age_ms}ms)'
            )
            raise e
    else:
        print(
            f'Dropped function with cloud event {event_id}, event outside allowed retry time. (event age {current_age_ms:.2f}ms of max age {max_age_ms}ms)'
        )
        return 'Timeout'
