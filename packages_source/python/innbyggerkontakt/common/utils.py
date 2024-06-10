"""Common utilities"""


def divide_list(my_list, chunk_size):
    """Divide list my_list in chunks chunck_size"""
    for iterator in range(0, len(my_list), chunk_size):
        yield my_list[iterator:iterator + chunk_size]
