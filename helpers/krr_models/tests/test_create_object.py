from krr_models import DigitalPostResource


def test_create_a_digital_post_resource():
    d = DigitalPostResource(
        postkasseadresse='Veiveien', postkasseleverandoeradresse='Husveien'
    )
    assert isinstance(d, DigitalPostResource)
