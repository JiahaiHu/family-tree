# encoding=utf8

from application.models import Base

from sqlalchemy import Column, Integer, ForeignKey


class GroupRelation(Base):

    __tablename__ = "group_relation"

    group_from_id = Column(Integer,
                           ForeignKey("groups.group_id", ondelete="CASCADE"),
                           nullable=False, primary_key=True,
                           autoincrement=False)
    group_to_id = Column(Integer,
                         ForeignKey("groups.group_id", ondelete="CASCADE"),
                         nullable=False, primary_key=True,
                         autoincrement=False)
    year = Column(Integer, nullable=False)

    def __init__(self, group_from_id, group_to_id, year):
        self.group_from_id = group_from_id
        self.group_to_id = group_to_id
        self.year = year
