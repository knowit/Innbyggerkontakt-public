"""SMS event document from Firestore."""
from cloud_event_model import JsonModel
from google.api_core.datetime_helpers import DatetimeWithNanoseconds


class BatchData(JsonModel):
    """Batch data to keep track of progress."""

    batch_id: str
    batch_size: int


class SmsEventDocument(JsonModel):
    """SMS event document from Firestore as Pydentic base model."""

    status: str
    created: DatetimeWithNanoseconds | None = None
    updated: DatetimeWithNanoseconds | None = None
    object_path: str
    bulletin_id: str
    org_id: str
    batch: BatchData | None = None
