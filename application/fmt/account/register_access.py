# encoding=utf8

import tornado.web
import ujson as json

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request
from application.common import response
from application.models import User, UserGroup, UserMentor
from application.core import controller
from application.fmt.account.user_program import ProgramCreateHandler


class RegisterAccessStep1Handler(BaseHandler):

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
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /account/fillin/step1 完善基本信息
        @apiVersion 0.1.0
        @apiName FillinStep1
        @apiGroup Account

        @apiDescription 完善信息，包括必填和非必填的信息。
        - 其中`groups`,`mentors`为必填信息，不能为空。
        - `settings`,`friends`,`programs`内容可以为相应空的类型，但必须有这个字段。


        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "groups": [
                        "ESD#2013",
                        "Lab#2014"
                    ],
                    "mentors": [3],
                    "settings": {
                        "blog": "http://www.baidu.com"[optional],
                        "avatar": "base64_str"[optional],
                        "wechat_id": "wechatID"[optional],
                        "location": "WuHan"[optional],
                        "is_graduated": true
                    }
                }
            }

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()

        if user.is_basic_completed:
            raise response.ResponseException("你已完善过信息")

        try:
            # group and mentor
            self._check_basic_info(user, fparams)

            # avatar, blog, wechat_id, is_graduated, location
            self._check_personal_info(user, fparams)

            self.session.commit()
        except:
            self.session.rollback()
            raise

        return {"avatar": user.avatar}

    def _check_basic_info(self, user, fparams):
        group_info_transcations = self._get_group_info(user, fparams)

        mentor_info_transcations = controller.UpdateUserInfo.get_user_mentor_from_raw(self, user, fparams)

        # save basic info
        for year, group_set in group_info_transcations.items():
            for group_id in group_set:
                ug = UserGroup(self.current_user, group_id, year)
                self.session.add(ug)
        for user_id in mentor_info_transcations:
            um = UserMentor(user_id, self.current_user)
            self.session.add(um)
        user.is_basic_completed = True

    def _check_personal_info(self, user, fparams):
        personal_info = fparams.info.get("settings")
        if personal_info is None or not isinstance(personal_info, dict):
            raise response.ResponseException("参数错误")

        # avatar
        avatar_str = personal_info.get("avatar")
        if avatar_str:
            controller.UpdateUserInfo.save_avatar(self, avatar_str)

        if "is_graduated" not in personal_info:
            raise response.ResponseException("参数错误")

        # blog, wechat, location, is_graduated
        other_info = {}
        entries = ["blog", "wechat_id", "location", "is_graduated"]
        for k in entries:
            v = personal_info.get(k)
            if v:
                other_info[k] = v

        if other_info:
            self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).update(other_info)

    def _get_group_info(self, user, fparams):
        assert isinstance(user, User)

        group_info = fparams.info.get("groups")
        if not group_info or not isinstance(group_info, list):
            raise response.ResponseException("组别信息必填或格式错误")

        if len(group_info) > constants.MemberConfig.MAX_GROUP_LABEL_SUM:
            raise response.ResponseException("组别个数不能超过{}个".format(constants.MemberConfig.MAX_GROUP_LABEL_SUM))

        # get new groups
        group_info_transcations = {}
        for group in group_info:
            year, group_id = controller.UpdateUserInfo.get_user_group_from_raw(self, group)
            if year in group_info_transcations:
                group_info_transcations[year].add(group_id)
            else:
                group_info_transcations[year] = {group_id}

        return group_info_transcations


"""
@api {post} /account/fillin/step2 完善项目信息
@apiVersion 0.1.0
@apiName FillinStep2
@apiGroup Account

@apiDescription 完善项目中的信息


@apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

@apiParamExample {json} Request-Example
    {
        "info": {
                "year": 2010,
                "title": "program title",
                "description": "description blabla",
                "member": [1, 2, 3]
                "logo": base64_string[optional],
                "image": base64_string[optional]
        }
    }

@apiUse MessageFail
"""
RegisterAccessStep2Handler = ProgramCreateHandler
