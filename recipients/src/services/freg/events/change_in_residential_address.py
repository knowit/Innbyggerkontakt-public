"""Event "Endring i bostedsadresse" """

from typing import List, Union

from models.event_model import InternalEventType
from models.freg_model import FregPerson, ResidentialAddress


def internal_event_type(freg_person: FregPerson) -> (InternalEventType, str):
    """Return InternalEventType or None if person didn't move"""
    new_residential_address, last_residential_address = _get_residential_adresses(freg_person.residential_address)
    new_municipality_number = _get_municipality_number(new_residential_address)
    old_municipality_number = _get_municipality_number(last_residential_address)

    if not new_residential_address:
        return None, None

    if not new_municipality_number:
        return None, None

    if not last_residential_address:
        return InternalEventType.MOVE_TO_MUNICIPALITY, new_municipality_number

    if new_municipality_number != old_municipality_number:
        return InternalEventType.MOVE_TO_MUNICIPALITY, new_municipality_number

    if new_municipality_number == old_municipality_number:
        return InternalEventType.MOVE_WITHIN_MUNICIPALITY, new_municipality_number

    return None, None


def _get_residential_adresses(
        residential_addresses: List[ResidentialAddress]
) -> (ResidentialAddress, ResidentialAddress):
    new_residential_address = next(
        (residential_address for residential_address in residential_addresses if residential_address.are_ruling),
        None
    )
    last_residential_address = next(
        (residential_address for residential_address in residential_addresses if not residential_address.are_ruling),
        None
    )

    return new_residential_address, last_residential_address


def _get_municipality_number(address: ResidentialAddress) -> Union[str, None]:
    return address.road_address.municipality_number if address and address.road_address \
        else address.unknown_place_of_residence.municipality_number if address and address.unknown_place_of_residence \
        else None
