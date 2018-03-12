# encoding=utf8

import logging

from application.models import Session
from application.scripts import insertion


def generate_inv_code(session=None):
    sess = session or Session()
    inv = insertion.insert_inv_code(sess)
    if session:
        sess.commit()
    return inv


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    logging.info(generate_inv_code())
