# pylint: disable=C0115,C0116,R0903
"""Models for data from recipients."""
from innbyggerkontakt.models.basic_persons import Person


class MatrikkelPerson(Person):
    """An Matrikkel-person that contains freg_identifier (nnid) and name."""

    class Config:
        """
        Overrided from pydentic.BaseModel.

        If Config.allow_population_by_field_name=True,
        the generated signature will use the field names, rather than aliases.
        """

        allow_population_by_field_name = True

    freg_identifier: str
