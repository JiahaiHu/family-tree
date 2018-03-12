# encoding=utf8

import time

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from application.models import Base


class InvCode(Base):

    __tablename__ = "inv_code"

    inv_id = Column(Integer, primary_key=True)
    code = Column(String(32), nullable=False, unique=True)
    is_used = Column(Boolean, nullable=False, default=False)
    is_marked = Column(Boolean, nullable=False, default=False)
    to_email = Column(String(30))
    created_time = Column(String(12), nullable=False)

    registered_users = relationship("User", backref="inv_code")

    def __init__(self, code, is_used=False, to_email=None):
        self.code = code
        self.is_used = is_used
        self.to_email = to_email
        self.created_time = str(int(time.time()))
