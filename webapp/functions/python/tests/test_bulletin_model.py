from datetime import date
from unittest import TestCase

from freezegun import freeze_time

from models.bulletin import Query


@freeze_time('2020-10-21')
class TestBulletinModel(TestCase):
    def test_bulletin_recipients_query_model_body_age_older_than(self):
        age = {'filter': 'olderThan', 'olderThan': 30}

        query = Query(age=age)
        assert query.date_of_birth_to == date(year=1990, month=10, day=21)
        assert query.date_of_birth_from is None

    def test_bulletin_recipients_query_model_body_age_younger_than(self):
        age = {'filter': 'youngerThan', 'youngerThan': 30}

        query = Query(age=age)
        assert query.date_of_birth_from == date(year=1990, month=10, day=21)
        assert query.date_of_birth_to is None

    def test_bulletin_recipients_query_model_body_age_age_between(self):
        age = {'filter': 'ageBetween', 'fromAge': 30, 'toAge': 50}

        query = Query(age=age)
        assert query.date_of_birth_to == date(year=1990, month=10, day=21)
        assert query.date_of_birth_from == date(year=1970, month=10, day=21)

    def test_bulletin_recipients_query_model_body_age_after_date(self):
        age = {'filter': 'afterDate', 'afterDate': '2000-5-12'}

        query = Query(age=age)
        assert query.date_of_birth_to is None
        assert query.date_of_birth_from == date(year=2000, month=5, day=12)

    def test_bulletin_recipients_query_model_body_age_before_date(self):
        age = {'filter': 'beforeDate', 'beforeDate': '2000-5-12'}

        query = Query(age=age)
        assert query.date_of_birth_to == date(year=2000, month=5, day=12)
        assert query.date_of_birth_from is None

    def test_bulletin_recipients_query_model_body_age_between_date(self):
        age = {'filter': 'betweenDate', 'fromDate': '2000-5-12', 'toDate': '2005-1-1'}

        query = Query(age=age)
        assert query.date_of_birth_to == date(year=2005, month=1, day=1)
        assert query.date_of_birth_from == date(year=2000, month=5, day=12)

    def test_bulletin_recipients_query_model_body_age_beetween_years(self):
        age = {'filter': 'betweenYears', 'fromYear': '2000', 'toYear': '2010'}

        query = Query(age=age)
        assert query.date_of_birth_to is None
        assert query.date_of_birth_from is None
        assert query.year_of_birth_from == '2000'
        assert query.year_of_birth_to == '2010'

    def test_bulletin_recipients_query_model_body_age_turn_x_years(self):
        age = {'filter': 'turnXYears', 'age': 34}

        query = Query(age=age)
        assert query.birth_date == date(year=1986, month=10, day=21)

    def test_bulletin_recipients_query_model_body_age_turn_x_months(self):
        age = {'filter': 'turnXMonths', 'age': 6}

        query = Query(age=age)
        assert query.birth_date == date(year=2020, month=4, day=21)

    def test_bulletin_recipients_query_model_body_age_turn_x_days(self):
        age = {'filter': 'turnXDays', 'age': 25}

        query = Query(age=age)
        assert query.birth_date == date(year=2020, month=9, day=26)

    def test_bulletin_recipients_query_model_body_age_empty(self):
        age = {}

        query = Query(age=age)
        assert query.date_of_birth_to is None
        assert query.date_of_birth_from is None
        assert query.year_of_birth_from is None
        assert query.year_of_birth_to is None
        assert query.age is None
