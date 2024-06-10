"""Birthdate filter"""
from models.freg_model import Person
from models.query_model import Query


def filter_function(person: Person, query: Query):
    """Return True if persons birthdate match the filter else return False."""
    birth_object = next(
        (birth for birth in person.freg_person.birth if birth.are_ruling is True), None
    )

    if not (
        query.date_of_birth_from
        or query.date_of_birth_to
        or query.year_of_birth_from
        or query.year_of_birth_to
        or query.birth_date
    ):
        return True  # No need to check further

    if not birth_object:
        return False  # Should not happen, maybe throw an error, or at least log this abnormality that freg person does not have birth_object.

    checks = [
        _check_date_from(query.date_of_birth_from, birth_object.date_of_birth),
        _check_date_to(query.date_of_birth_to, birth_object.date_of_birth),
        _check_year_from(query.year_of_birth_from, birth_object.date_of_birth.year),
        _check_year_to(query.year_of_birth_to, birth_object.date_of_birth.year),
        _check_date_of_birth(query.birth_date, birth_object.date_of_birth),
    ]

    return all(checks)


def _check_date_of_birth(q_birth_date, person_birth_date):
    """Return True if persons birthdate match the filter else return False."""
    if q_birth_date and person_birth_date != q_birth_date:
        return False
    return True


def _check_year_to(q_birth_year, person_birth_year):
    """Return True if persons birthdate match the filter else return False."""

    if q_birth_year and person_birth_year > q_birth_year:
        return False
    return True


def _check_year_from(q_birth_year, person_birth_year):
    """Return True if persons birthdate match the filter else return False."""

    if q_birth_year and person_birth_year < q_birth_year:
        return False
    return True


def _check_date_to(q_birth_date, person_birth_date):
    """Return True if persons birthdate match the filter else return False."""
    if q_birth_date and person_birth_date > q_birth_date:
        return False
    return True


def _check_date_from(q_birth_date, person_birth_date):
    """Return True if persons birthdate match the filter else return False."""
    if q_birth_date and person_birth_date < q_birth_date:
        return False
    return True
