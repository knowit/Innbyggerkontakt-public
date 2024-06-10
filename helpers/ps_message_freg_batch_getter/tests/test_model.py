from ps_message.freg_batch_getter import FregBatchGetter


def test_create_an_instance():
    fbg = FregBatchGetter(batchId=1, jobbId='asdf', bulletinId='qwerfsd')
    assert fbg is not None
