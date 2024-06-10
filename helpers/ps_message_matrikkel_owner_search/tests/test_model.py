from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)


def test_create_instance():

    mse = MatrikkelOwnerSearchEvent(
        organizationId='asdf',
        bulletinId='asdf',
        municipality_number='asdf',
        matrikkel_ids_path='asdf',
        current_batch=0,
        total_batches=1,
    )
    assert mse is not None
