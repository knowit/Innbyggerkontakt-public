"""Model that contains Abstract Person classes."""
from pydantic import BaseModel, ValidationError


def _get_all_subclasses(parent_class):
    children = parent_class.__subclasses__()
    grandchildren = []
    for child in children:
        grandchildren += _get_all_subclasses(child)
    return children + grandchildren


class Person(BaseModel):
    """Abstract Person class in order to Unify all persons."""

    def __new__(cls, **kwargs):
        if cls is not Person:
            return super(Person, cls).__new__(cls)

        # Go ahead and try to cast to a subclass of Person.
        excpected_types = _get_all_subclasses(Person)
        _parsed_person = None
        while not _parsed_person and excpected_types:
            _e = excpected_types.pop()
            try:
                _parsed_person = _e.parse_obj(kwargs)
                return _parsed_person
            except (TypeError, ValidationError):
                continue  # Try the next subclass.
        raise TypeError(
            f'Cannot instansiate a Person from {cls}.')  # Give up.


class NamedPerson(Person):
    """Person with name."""

    name: str


class EmailPerson(Person):
    """Person with email."""

    email: str


class PersonWithNameAndEmail(NamedPerson, EmailPerson):
    """Person with name and Email, mainly for demonstration purpose."""
