# encoding=utf8

import tornado.web
import ujson as json

from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request
from application.common import response
from application.models import User, UserMentor
from application.core import controller
from application.fmt import render


class UserMentorModifyHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("info", str, validates=[
                    (lambda k: json.decode(k), )
                ], uses=[
                    (lambda k: json.decode(k), )
                ])
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    def get(self):
        """
        @api {get} /settings/m/mentor 获取mentor、mentee信息
        @apiVersion 0.1.0
        @apiName GetUserMentor
        @apiGroup Settings

        @apiDescription 获取mentor、mentee信息

        @apiParam {String} [key] 用户id，若为空，则查看自己的信息

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    "mentors": [{
                        "username": "name",
                        "avatar": "",
                        "user_id": 3
                    }],
                    "mentees": [{
                        "username": "name",
                        "avatar": "",
                        "user_id": 1
                    }]
                }
            }

        @apiUse MessageFail
        """
        user = render.homepage.get_user(self)
        result = render.homepage.get_mentor_mentee(user)

        return result

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/mentor 修改mentor信息
        @apiVersion 0.1.0
        @apiName ModifyUserMentor
        @apiGroup Settings

        @apiDescription 修改mentor信息，完整更换

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "mentors": [2]
                }
            }

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()

        # delete mentor info
        for um in user.user_mentors:
            self.session.delete(um)

        # add mentor info
        mentor_info_transcations = controller.UpdateUserInfo.get_user_mentor_from_raw(self, user, fparams)
        for user_id in mentor_info_transcations:
            um = UserMentor(user_id, self.current_user)
            self.session.add(um)

        self.session.commit()
        return {"message": "ok"}
