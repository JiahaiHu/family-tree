# encoding=utf8

import logging

from sqlalchemy.exc import OperationalError

from application.models import Base, engine


def rebuild_db():
    #try:
    #    Base.metadata.drop_all(engine, checkfirst=False)
    #except OperationalError as e:
    #    logging.warning(e.message)
    #    logging.warning("Did you build database 'fmt'?")
    Base.metadata.create_all(engine)


if __name__ == "__main__":
    rebuild_db()
