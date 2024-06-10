from freg_models.folkeregisteret.tilgjengeliggjoering.person.v1 import Personnavn


def test_create_a_name():
    p = Personnavn(etternavn='Duck', fornavn='Donald')
    assert isinstance(p, Personnavn)
