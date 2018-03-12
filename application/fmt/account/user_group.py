# encoding=utf8

import tornado.web

from application.baseview import BaseHandler
from application.common import request
from application.common import response
from application.fmt import render


class UserGroupModifyHandler(BaseHandler):

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    def get(self):
        """
        @api {get} /settings/m/group 获取组别tag
        @apiVersion 0.1.0
        @apiName GetUserGroup
        @apiGroup Group

        @apiDescription 获取当前用户的组别tag

        @apiParam {String} [key] 用户id，若为空，则查看自己的信息

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": [
                    "ESD#2013",
                    "Lab#2014"
                ]
            }

        @apiUse MessageFail
        """
        user = render.homepage.get_user(self)
        result, _ = render.homepage.get_group(user)
        return result
