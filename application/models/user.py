# encoding=utf8

import time

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from application.models import Base
from application.constants import MemberConfig


class User(Base):

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(30), nullable=False)
    email = Column(String(30), nullable=False, unique=True)
    password = Column(String(67), nullable=False)
    avatar = Column(String(100), default=MemberConfig.DEFAULT_AVATAR_PATH)
    blog = Column(String(50))
    wechat_id = Column(String(50))
    location = Column(String(50))
    inv_id = Column(Integer, ForeignKey("inv_code.inv_id", ondelete="SET NULL"))
    created_time = Column(String(12), nullable=False)
    is_graduated = Column(Boolean, nullable=False, default=False)
    is_activated = Column(Boolean, nullable=False, default=False)
    is_basic_completed = Column(Boolean, nullable=False, default=False)
    is_root = Column(Boolean, nullable=False, default=False)

    activities = relationship("Activity",
                              secondary="user_activity",
                              backref="users",
                              passive_deletes=True)

    mentors = association_proxy("user_mentors", "mentor")
    mentees = association_proxy("user_mentees", "mentee")
    groups = association_proxy("user_groups", "group")

    def __init__(self, name, email, password, is_activated=False):
        assert len(password) <= 67
        self.username = name
        self.email = email
        self.password = password
        self.is_activated = is_activated
        self.created_time = str(int(time.time()))
