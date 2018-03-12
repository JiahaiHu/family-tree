# encoding=utf8

import logging

from application.models import User, Group, InvCode, GroupRelation
from application.common import util


def insert_inv_code(session):
    inv_code = util.generate_inv_code()
    while session.query(InvCode).filter(InvCode.code == inv_code).first():
        inv_code = util.generate_inv_code()
    inv = InvCode(inv_code)
    session.add(inv)
    session.flush()
    return inv


def insert_users(session, data, default_password="123456"):
    assert isinstance(data, list)

    users = []
    for item in data:
        if len(item) == 2:
            username, email = item
            password = default_password
        else:
            username, email, password = item

        inv = insert_inv_code(session)
        inv.is_used = True
        session.flush()

        user = User(username, email, util.generate_password(password), is_activated=True)
        user.is_basic_completed = True
        user.inv_id = inv.inv_id
        session.add(user)

        logging.info(u"User: username: {}, email: {}".format(user.username, user.email))
        users.append(user)

    return users


def insert_groups(session, data, default_start=2000, default_end=-1):
    assert isinstance(data, list)

    groups = []
    for item in data:
        if len(item) == 1:
            group_name, = item
            start = default_start
            end = default_end
        else:
            group_name, start, end = item
        group = Group(group_name, start, end)
        session.add(group)
        session.flush()
        logging.info(u"Group: group_name: {}".format(group.group_name))
        groups.append(group)

    return groups


def insert_root_users(session, data):
    assert isinstance(data, list)
    users = insert_users(session, data)
    for user in users:
        user.is_root = True
        logging.info("admin: email: {}".format(user.email))
    session.flush()
    return users


def insert_group_relation(session, data):
    grs = []
    for item in data:
        g_from, g_to, year = item
        gr = GroupRelation(g_from.group_id, g_to.group_id, year)
        session.add(gr)
        logging.info("GroupRelation: %s %s %s" % (g_from.group_name, g_to.group_name, year))
        grs.append(gr)

    session.flush()
    return grs
