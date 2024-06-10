"""Module that contains Telefonnummer and assure_unique_phone_numbers."""
import re

from pydantic import BaseModel, validator


class Telefonnummer(BaseModel):
    """A valid phone number."""

    number: str

    @validator('number', pre=True)
    def assure_valid_phone_number(cls, value):
        """Transform number to right format."""
        if not isinstance(value, str):
            raise ValueError('must be a string')

        # Remove all spaces, hyphens, underscores and parentheses
        chars_to_remove = str.maketrans(
            {' ': None, '-': None, '_': None, '(': None, ')': None}
        )
        value = value.translate(chars_to_remove)

        # Assure '+' and country calling code
        if (len(value) == 8) and not value.startswith('+'):
            value = '+47' + value
        if value.startswith('00'):
            value = value.replace('00', '+', 1)

        return value

    @validator('number')
    def number_has_correct_form(cls, value):
        """Check number against valid regex."""
        form_regex = re.compile(r'^\+\d{7,15}$')
        if form_regex.match(value) is None:
            raise ValueError('must be on correct form')
        return value

    @validator('number')
    def number_has_correct_prefix(cls, value):
        """Check prefix of number against valid prefixes (country calling codes)."""
        prefix_regex = re.compile(
            r'^\+(1|2[07]|2[12345689]\d|3[0123469]|3[578]\d|4[013456789]|42\d|5[12345678]|5[09]\d|6[0123456]|6[789]\d|7|8[1246]|8[035789]\d|9[0123458]|9[679]\d)(?=\d{4,14}$)'
        )
        if prefix_regex.match(value) is None:
            raise ValueError('must use a valid country calling code')
        return value

    @validator('number')
    def norwegian_number_is_correct(cls, value):
        """Assure that norwegian numbers start with '4' or '9'."""
        # if norwegian number, check that it is a mobile number
        if '+47' in value and not ('+474' in value or '+479' in value):
            raise ValueError('must be a mobile number')
        return value


def assure_unique_phone_numbers(numbers: list[Telefonnummer]) -> list[Telefonnummer]:
    """
    Filter out duplicates in a phone number list.

    Args:
        numbers: a list of Telefonnummer objects
    Returns:
        the list of Telefonnummer objects where duplicates are removed
    """
    result_numbers: list[Telefonnummer] = []
    valid_unique_numbers = set()

    for number in numbers:
        if number is not None and number.number not in valid_unique_numbers:
            valid_unique_numbers.add(number.number)
            result_numbers.append(number)

    return result_numbers
