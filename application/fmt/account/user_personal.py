# encoding=utf8

import tornado.web
import ujson as json

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item, Helper
from application.common import request
from application.common import response
from application.common import util
from application.models import User, UserGroup
from application.core import controller
from application.fmt import render


class UserPersonalModifyHandler(BaseHandler):

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
        @api {get} /settings/m/personal 获取个人信息
        @apiVersion 0.1.0
        @apiName GetUserSettings
        @apiGroup Settings

        @apiDescription 获取个人信息，如avatar, blog, wechat_id, is_graduated, location

        @apiParam {String} [key] 用户id，若为空，则查看自己的信息

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "user_id": 1,
                    "username": "test1"
                    "is_graduated": true
                    "blog": "http://www.baidu.com",
                    "wechat_id": null,
                    "location": null,
                    "email": "test@qq.com",
                    "avatar": "/upload/avatar/c20272c3b6d1121d2626e4e5eeb42ab7.png",
                }
            }

        @apiUse MessageFail
        """
        user = render.homepage.get_user(self)
        result = render.homepage.get_personal(user)

        return result

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/personal 修改个人信息
        @apiVersion 0.1.0
        @apiName ModifyUserSettings
        @apiGroup Settings

        @apiDescription 修改个人信息，如blog, wechat_id, is_graduated, location, groups

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "settings": {
                        "blog": "http://www.baidu.com"[optional],
                        "wechat_id": "wechatID"[optional],
                        "location": "WuHan"[optional],
                        "is_graduated": true,
                        "groups": [
                            "ESD#2013",
                            "Lab#2014"
                        ]
                    }
                }
            }

        @apiUse MessageFail
        """
        personal_info = fparams.info.get("settings")
        if personal_info is None or not isinstance(personal_info, dict):
            raise response.ResponseException("参数错误")

        # blog, wechat_id, location, is_graduated
        other_info = {}
        entries = ["blog", "wechat_id", "location", "is_graduated"]
        for k in entries:
            v = personal_info.get(k)
            if v:
                other_info[k] = v

        if other_info:
            self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).update(other_info)

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()

        # delete old group relation
        for ug in user.user_groups:
            self.session.delete(ug)

        # add new group relation
        group_info_transcations = self._get_group_info(user, fparams)
        for year, group_set in group_info_transcations.items():
            for group_id in group_set:
                ug = UserGroup(self.current_user, group_id, year)
                self.session.add(ug)

        self.session.commit()
        return {"message": "ok"}

    def _get_group_info(self, user, fparams):
        assert isinstance(user, User)

        group_info = fparams.info.get("settings").get("groups")
        if not group_info or not isinstance(group_info, list):
            raise response.ResponseException("组别信息必填或格式错误")

        if len(group_info) >= constants.MemberConfig.MAX_GROUP_LABEL_SUM:
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


class UserPasswordModifyHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("origin", str, validates=[
                    (Helper.is_valid_password, None, "密码长度应在6~16位之间"),
                ]),
                Item("password", str, validates=[
                    (Helper.is_valid_password, None, "密码长度应在6~16位之间"),
                ])
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/passwd 修改密码
        @apiVersion 0.1.0
        @apiName UserPasswordModify
        @apiGroup Settings

        @apiDescription 修改个人密码

        @apiParam {String} origin 当前密码
        @apiParam {String} password 密码（密码长度应在6~16位之间）

        @apiUse MessageFail
        """
        if fparams.origin == fparams.password:
            raise response.ResponseException("修改前后密码一致")

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()
        if not util.is_correct_password(fparams.origin, user.password):
            raise response.ResponseException("密码错误")

        user.password = util.generate_password(fparams.password)

        self.session.commit()

        return {"message": "ok"}


class UserAvatarHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("avatar", str)
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/personal/avatar 更改头像
        @apiVersion 0.1.0
        @apiName ModifyUserAvatar
        @apiGroup Settingso

        @apiDescription 上传头像，返回相应的url

        @apiParam {String} avatar 头像base64 str

        @apiSuccess {String} avatar url of avatar

        @apiParamExample {json} Request-Example
            {
                "avatar": "base64_str",
            }

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()

        # avatar
        avatar_str = fparams.avatar

        if user.avatar:
            controller.UpdateUserInfo.delete_avatar(self, user)
        controller.UpdateUserInfo.save_avatar(self, avatar_str)

        self.session.commit()
        return {"avatar": user.avatar}
