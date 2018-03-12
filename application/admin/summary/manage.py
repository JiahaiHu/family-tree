# encoding=utf8

import tornado.web

from application import constants
from application.models import Group, UserGroup
from application.common import request, response, util
from application.baseview import BaseHandler


class IndexHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.html_response
    def get(self):
        self.render("summary.html")


class GroupSummaryHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    def get(self):
        """
        @api {get} /admin/summary/group 获取组别统计信息
        @apiVersion 0.1.0
        @apiName GroupSummary
        @apiGroup Admin
        @apiPermission root

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    Web: {
                        2010: 1,
                        2011: 1,
                        2012: 4,
                        2013: 4,
                        2014: 5,
                        2015: 4,
                        2016: 6
                    },
                    Alg: {
                        2010: 3,
                        2011: 6,
                        2012: 9,
                        2013: 10,
                        2014: 13
                    }
                }
            }

        @apiUse MessageFail
        """
        groups = self.session.query(Group).all()
        data = {}

        default_end = util.get_current_period()
        for group in groups:
            end_year = group.end_year if group.end_year != constants.GroupConfig.MAX_END_YEAR else default_end
            data[group.group_name] = {x: 0 for x in range(group.start_year, end_year + 1, 1)}

        ugs = self.session.query(UserGroup).all()
        for ug in ugs:
            data[ug.group.group_name][ug.year] += 1

        return data


class ComponentSummaryHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    def get(self):
        """
        @api {get} /admin/summary/group 获取团队组成统计信息
        @apiVersion 0.1.0
        @apiName ComponentSummary
        @apiGroup Admin
        @apiPermission root

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    2003: {
                        "软设": 4,
                        "IT": 1,
                        "PM": 1
                    },
                    2004: {
                        "软设": 7,
                        "IT": 2,
                        "PM": 2
                    },
                    2005: {
                        "软设": 8,
                        "IT": 5,
                        "PM": 2
                    }
                }
            }

        @apiUse MessageFail
        """
        groups = self.session.query(Group).all()
        data = {}

        default_end = util.get_current_period()
        for group in groups:
            end_year = group.end_year if group.end_year != constants.GroupConfig.MAX_END_YEAR else default_end
            data[group.group_name] = {x: 0 for x in range(group.start_year, end_year + 1, 1)}

        ugs = self.session.query(UserGroup).all()
        for ug in ugs:
            data[ug.group.group_name][ug.year] += 1

        result = {}
        for group_name, year_nums in data.items():
            for year, nums in year_nums.items():
                if year not in result:
                    result[year] = {group_name: nums}
                else:
                    result[year][group_name] = nums

        return result
