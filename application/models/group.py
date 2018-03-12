# encoding=utf8

import time

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from application.models import Base


class Group(Base):

    __tablename__ = "groups"

    group_id = Column(Integer, primary_key=True)
    group_name = Column(String(30), nullable=False, unique=True)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)
    created_time = Column(String(12), nullable=False)

    users = association_proxy("group_users", "user")

    group_from = relationship("GroupRelation",
                              foreign_keys="GroupRelation.group_from_id",
                              passive_deletes=True)
    group_to = relationship("GroupRelation",
                            foreign_keys="GroupRelation.group_to_id",
                            passive_deletes=True)

    def __init__(self, name, start, end):
        self.group_name = name
        self.start_year = start
        self.end_year = end
        self.created_time = str(int(time.time()))
