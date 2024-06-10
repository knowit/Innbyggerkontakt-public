"""Filters"""
import glob
from importlib import import_module
from os.path import dirname, basename, isfile, join

from models.query_model import Query
from models.freg_model import Person

modules = glob.glob(join(dirname(__file__), "*.py"))
__all__ = [basename(f)[:-3] for f in modules if isfile(f) and not f.endswith('__init__.py')]


def filter_function(person: Person, query: Query):
    """Return True if every filter pass else return False"""
    for module in __all__:
        mod = import_module(f'services.freg.filters.{module}')
        if not getattr(mod, 'filter_function')(person, query):
            return False
    return True
