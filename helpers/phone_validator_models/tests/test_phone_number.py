import pytest
from pydantic import ValidationError

from phone_validator_models.phone_validator_models import (
    Telefonnummer,
    assure_unique_phone_numbers,
)


def test_create_a_phone_number():
    number = Telefonnummer(number='+4740000000')
    assert isinstance(number, Telefonnummer)
    assert number.number == '+4740000000'


def test_duplicate_phone_numbers():
    input_numbers = [
        Telefonnummer(number='+47 9000 0000'),
        Telefonnummer(number='0047-90-00-00-00'),
        Telefonnummer(number='900_00_000'),
    ]
    result = assure_unique_phone_numbers(input_numbers)
    assert len(result) == 1
    assert result[0].number == '+4790000000'


@pytest.mark.parametrize(
    ('test_number', 'expected'),
    [('+1 (000) 000-0000', '+10000000000'), ('+683 0000', '+6830000')],
)
def test_international_phone_numbers(test_number, expected):
    assert Telefonnummer(number=test_number).number == expected


@pytest.mark.parametrize(
    'input_numbers', ['0001 0000 0000', '+47 000 00 000', '+1 00 00']
)
def test_invalid_phone_numbers(input_numbers):
    with pytest.raises(ValidationError):
        Telefonnummer(number=input_numbers)
