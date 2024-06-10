from models.query_model import Query
from services.freg.freg_service import query_generator


def test_get_query_for_freg_empty():
    queries = [
        Query()
    ]
    response = query_generator.get_query_for_freg(queries, '0000')
    assert response == {
        'foedselsaarFraOgMed': None,
        'foedselsaarTilOgMed': None,
        'kjoenn': None,
        'personstatustyper': ['bosatt'],
        'sivilstandstype': None,
        'kommunenummer': {
            'bostedskommunenummer': '0000'
        }
    }


def test_get_query_for_freg_one_with_all():
    queries = [
        Query(zip_codes=['0000', '1111'], gender='mann', year_of_birth_from=2000,
              year_of_birth_to=2020, include_residing_address=True, find_parent=True,
              marital_status_types=['gift'])
    ]
    response = query_generator.get_query_for_freg(queries, '0000')
    assert response == {
        'foedselsaarFraOgMed': 2000,
        'foedselsaarTilOgMed': 2020,
        'kjoenn': 'mann',
        'personstatustyper': ['bosatt'],
        'sivilstandstype': 'gift',
        'kommunenummer': {
            'bostedskommunenummer': '0000'
        }
    }


def test_get_query_for_freg_two_with_all_different():
    queries = [
        Query(zip_codes=['0000', '1111'], gender='mann', year_of_birth_from=2000,
              year_of_birth_to=2020, include_residing_address=True, find_parent=True,
              marital_status_types=['gift']),
        Query(zip_codes=['2222', '3333'], gender='kvinne', year_of_birth_from=1980,
              year_of_birth_to=2000, include_residing_address=False, find_parent=False,
              marital_status_types=['ugift'])
    ]
    response = query_generator.get_query_for_freg(queries, '0000')
    assert response == {
        'foedselsaarFraOgMed': None,
        'foedselsaarTilOgMed': None,
        'kjoenn': None,
        'personstatustyper': ['bosatt'],
        'sivilstandstype': None,
        'kommunenummer': {
            'bostedskommunenummer': '0000'
        }
    }


def test_get_query_for_freg_with_residing_address():
    queries = [
        Query(zip_codes=['0000', '1111'], gender='mann', year_of_birth_from=2000,
              year_of_birth_to=2020, include_residing_address=True, find_parent=True,
              marital_status_types=['gift']),
    ]
    response = query_generator.get_query_for_freg(queries, '0000', residing_address=True)
    assert response == {
        'foedselsaarFraOgMed': 2000,
        'foedselsaarTilOgMed': 2020,
        'kjoenn': 'mann',
        'personstatustyper': ['bosatt'],
        'sivilstandstype': 'gift',
        'kommunenummer': {
            'oppholdskommunenummer': '0000'
        }
    }
