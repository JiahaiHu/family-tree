# encoding=utf8

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship, backref

from application.models import Base


class UserMentor(Base):

    __tablename__ = "user_mentor"

    mentor_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"),
                       nullable=False, primary_key=True, autoincrement=False)
    mentee_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"),
                       nullable=False, primary_key=True, autoincrement=False)

    mentor = relationship("User",
                          backref=backref("user_mentees", passive_deletes=True),
                          foreign_keys="UserMentor.mentor_id")

    mentee = relationship("User",
                          backref=backref("user_mentors", passive_deletes=True),
                          foreign_keys="UserMentor.mentee_id")

    def __init__(self, mentor_id, mentee_id):
        self.mentor_id = mentor_id
        self.mentee_id = mentee_id
