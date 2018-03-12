# encoding=utf8

from collections import namedtuple

from application import constants
from application.baseview import BaseHandler
from application.common import response
from application.models import User, Group, UserGroup
from application.common import util


UserItem = namedtuple("UserItem", ["user_id", "username", "avatar", "homepage"])
UserItem.dump = lambda user: {"user_id": user.user_id, "username": user.username, "avatar": user.avatar}


class TimeLineFetchHandler(BaseHandler):

    @response.json_response
    def get(self):
        """
        @api {get} /render/timeline 获取首页timeline信息
        @apiVersion 0.1.0
        @apiName Timeline
        @apiGroup Render

        @apiDescription 获取首页时间轴上的数据，相关的数字key都是ID

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    "users": {
                        2: {
                            "user_id": 2,
                            "username": "username",
                            "avatar": "",
                        }
                    },
                    "groups": {
                        5: {
                            "years": {
                                2013: [],
                                2014: [1, 2, 3]
                            },
                            "group_id": 5,
                            "group_from": [1, 2],
                            "group_to": [6],
                            "group_name": "ESD",
                        }
                    }
                }
            }

        @apiSuccess {Object} years          key为年份，value为该组成员ID列表
        @apiSuccess {Number[]} group_from   之前关联的组的ID列表
        @apiSuccess {Number[]} group_to     之后关联的组的ID列表

        @apiUse MessageFail
        """
        user_map = {u.user_id: UserItem(u.user_id, u.username, u.avatar, "")
                    for u in self.session.query(User).filter_by(is_activated=True).all()}
        group_map = {g.group_id: g for g in self.session.query(Group).all()}

        result = dict(groups=dict(), users=dict())
        selected = set()

        for group_id, group in group_map.items():
            start_year = group.start_year
            end_year = util.get_current_period() if group.end_year == constants.GroupConfig.MAX_END_YEAR else group.end_year

            info = {}
            year = start_year
            ugs = self.session.query(UserGroup).filter_by(group_id=group_id).all()
            while year <= end_year:
                info[year] = []
                for ug in [ug for ug in ugs if ug.year == year]:
                    info[year].append(ug.user_id)
                    selected.add(ug.user_id)
                year += 1

            result["groups"][group_id] = {
                "group_id": group.group_id,
                "group_name": group.group_name,
                "years": info,
                "group_from": [group_relation.group_from_id for group_relation in group.group_to],
                "group_to": [group_relation.group_to_id for group_relation in group.group_from],
            }

        result["users"] = {k: UserItem.dump(user_map[k]) for k in [k for k in iter(user_map.keys()) if k in selected]}

        return result
