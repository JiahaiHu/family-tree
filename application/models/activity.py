# encoding=utf8

import time

from sqlalchemy import Column, Integer, String

from application.models import Base
from application.constants import ProgramConfig


class Activity(Base):

    __tablename__ = "activity"

    activity_id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(300), nullable=False)
    year = Column(Integer, nullable=False)
    created_time = Column(String(12), nullable=False)
    admin_id = Column(Integer, nullable=False)
    logo = Column(String(100), default=ProgramConfig.DEFAULT_PROGRAM_LOGO_PATH)
    image = Column(String(100))

    def __init__(self, title, description, year, admin_id, logo=None, image=None):
        self.title = title
        self.description = description
        self.year = year
        self.created_time = str(int(time.time()))
        self.admin_id = admin_id
        self.logo = logo
        self.image = image
