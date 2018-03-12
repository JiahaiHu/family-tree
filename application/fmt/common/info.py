# encoding=utf8

from sqlalchemy import or_

from application import constants
from application.baseview import BaseHandler
from application.common import response, util
from application.models import Group


class GroupInfoHandler(BaseHandler):

    @response.json_response
    def get(self):
        """
        @api {get} /common/info/group 获取组基本信息
        @apiVersion 0.1.0
        @apiName GroupInfo
        @apiGroup Common

        @apiDescription 获取所有组的相关信息，当is_exist为0时，获取所有组别的信息，
        否则获取当前存在的组别信息

        @apiParam {Integer} [is_exist] 组别当前是否存在

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    "groups": [{
                        "group_id": 1,
                        "group_name": "Web",
                        "start_year": 2000,
                        "end_year": 2016
                    }],
                    "current_period": 2016
                }
            }

        @apiUse MessageFail
        """
        is_current = self.get_query_argument("is_exist", 0)
        current_period = util.get_current_period()

        if str(is_current) == "0":
            groups_raw = self.session.query(Group).all()
        else:
            groups_raw = self.session.query(Group).filter(
                or_(Group.end_year == current_period, Group.end_year == -1)
            )

        groups = [{
            "group_id": g.group_id,
            "group_name": g.group_name,
            "start_year": g.start_year,
            "end_year": current_period if g.end_year == constants.GroupConfig.MAX_END_YEAR else g.end_year
        } for g in groups_raw]
        return {"groups": groups, "current_period": current_period}
