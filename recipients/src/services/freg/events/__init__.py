"""Events"""
from models.freg_model import FregPerson
from models.event_model import FregEventType
from services.freg.events import change_in_residential_address  # , change_in_residing_address


def get_event_type(event: FregEventType, freg_person: FregPerson):
    """Return different modules based on different events"""
    return {
        FregEventType.CHANGE_IN_RESIDENTIAL_ADDRESS: change_in_residential_address,
        # FregEventType.CHANGE_IN_RESIDING_ADDRESS: change_in_residing_address
    }.get(event).internal_event_type(freg_person)
