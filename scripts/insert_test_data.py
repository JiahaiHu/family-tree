# encoding=utf8

import logging
import random

from tornado.options import options

from application import constants
from application.models import Session, Group, UserGroup
from application.common import util
from scripts import insertion


TEST_USER_TOTAL = 200
TAG_LIMIT_PER_USER = 3


def insert_user_group_relation(session, user, group):
    current_period = util.get_current_period()

    end_year = group.end_year
    if end_year == constants.GroupConfig.MAX_END_YEAR:
        end_year = current_period

    user_start_year = random.choice([x for x in xrange(group.start_year, end_year + 1)])

    year = user_start_year
    for x in range(TAG_LIMIT_PER_USER):
        if year > current_period:
            break

        if year > end_year:
            # get first child
            if group.group_from:
                group = session.query(Group).filter_by(group_id=group.group_from[0].group_to_id).first()
                end_year = group.end_year if end_year != constants.GroupConfig.MAX_END_YEAR else util.get_current_period()
            else:
                break

        session.add(UserGroup(user.user_id, group.group_id, year))
        logging.info("user_group: %s %s %s " % (user.username, group.group_name, year))
        year += 1

    session.flush()


def insert_test_data():
    session = Session()

    # add test users
    insertion.insert_root_users(session, [(u"联创团队", options.fmt_root_email, options.fmt_root_passwd)])
    users = insertion.insert_users(session, [("test%s" % x, "test_%s@qq.com" % x) for x in xrange(1, TEST_USER_TOTAL)])

    # add test groups
    groups = insertion.insert_groups(
        session,
        [
            (u"软设", 2003, 2009),
            (u"PM", 2003, -1),
            (u"IT", 2003, 2014),
            (u"Design", 2010, -1),
            (u"Web", 2010, -1),
            (u"Android", 2010, -1),
            (u"ESD", 2010, 2014),
            (u"Alg", 2010, 2014),
            (u"iOS", 2010, -1),
            (u"Lab", 2015, -1),
            (u"Game", 2016, -1),
        ]
    )
    software_g, pm_g, it_g, design_g, web_g, android_g,\
        esd_g, alg_g, ios_g, lab_g, game_g = groups

    insertion.insert_group_relation(
        session,
        [
            (software_g, web_g, 2005),
            (software_g, android_g, 2005),
            (software_g, design_g, 2005),
            (esd_g, lab_g, 2015),
            (it_g, lab_g, 2015),
            (alg_g, lab_g, 2015),
            (android_g, game_g, 2016),
        ]
    )

    # add tag test case
    for test_user in users:
        insert_user_group_relation(session, test_user, random.choice(groups))

    session.commit()


if __name__ == "__main__":
    insert_test_data()
