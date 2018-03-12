# encoding=utf8

from tornado.options import options

from application.models import Session
from scripts import insertion


def init():
    session = Session()

    # add users
    insertion.insert_root_users(session, [(u"联创团队", options.fmt_unique_email, options.fmt_unique_passwd)])

    # add groups
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
            (u"AI Lab",2017, -1),
        ]
    )

    software_g, pm_g, it_g, design_g, web_g, android_g,\
        esd_g, alg_g, ios_g, lab_g, game_g, ai_g = groups

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
            (lab_g,ai_g,2017),
        ]
    )

    session.commit()


if __name__ == "__main__":
    init()
