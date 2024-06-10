"""Generates a MatrikkelenhetsokModel object from a SearchModel object."""
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent
from suds.client import Client


def get_matrikkelenhet_sok_model(
    matrikkelenhet_client: Client, search_event: MatrikkelSearchEvent
):
    """Generates a MatrikkelenhetsokModel object from a SearchModel object."""
    sok_model = matrikkelenhet_client.factory.create('ns28:MatrikkelenhetsokModel')
    sok_model.kommunenummer = search_event.municipality_number
    return sok_model
