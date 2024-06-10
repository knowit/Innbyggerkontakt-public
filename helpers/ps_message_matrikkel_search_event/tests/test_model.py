from ps_message.matrikkel_search_event import MatrikkelSearchEvent, Polygon


def test_create_instance():

    polygon = Polygon(koordinatsystemKodeId=24, ytreAvgrensning=[[0, 1]])

    mse = MatrikkelSearchEvent(
        organizationId='asdf',
        bulletinId='asdf',
        municipality_number='asdf',
        polygons=[polygon],
        filter_id='filteridtest',
    )
    assert mse is not None
