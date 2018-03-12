# -*- coding: utf-8 -*-

import tornado.web
from sqlalchemy import and_

from application.baseview import BaseHandler
from application.common import request, response
from application.common.filtration import filtration, Item
from application.models import User


class SearchUserForAdminHandler(BaseHandler):

    """User search handler for admin"""

    def get_validation_args(self):
        return {
            "post": [
                Item("keyword", str, validates=[
                    (lambda k: "_" not in k and "%" not in k,)
                ])
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /admin/user/search 管理员搜索用户
        @apiVersion 0.1.0
        @apiName AdminSearchMember
        @apiGroup Admin

        @apiDescription 管理员搜索用户，与common中的借口在数据格式上不同

        @apiParam {String} keyword 不能含有'_'、'%'等特殊字符，否则直接报参数错误, "#"代表不存在任何组中

        @apiSuccessExample {json} Success-Example
        {
            "status": true,
            "message": [{
                "username": "test1",
                "user_id": 1,
                "avatar": "/upload/avatar/c20272c3b6d1121d2626e4e5eeb42ab7.png",
                "groups": ["Web#2014", "Lab#2015"]
            }]
        }

        @apiUse MessageFail
        """
        users = self.session.query(User).filter(and_(User.username.like("%" + fparams.keyword + "%"), User.is_activated == True)).all()
        result = [{
            "username": user.username,
            "user_id": user.user_id,
            "avatar": user.avatar or "",
            "groups": ["%s#%s" % (ug.group.group_name, ug.year) for ug in user.user_groups]
        } for user in users]

        return result
