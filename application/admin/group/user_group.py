# encoding=utf8

import tornado.web
from sqlalchemy import exists, and_

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request
from application.common import response
from application.common import util
from application.models import User, UserGroup, Group
from application.core import controller


class GroupMemberCreateHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("user_id", int),
                Item("tag", str),
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/ug/create 添加用户组标签
        @apiVersion 0.1.0
        @apiName UgCreate
        @apiGroup Admin
        @apiPermission root

        @apiDescription 添加用户在某年的组别标签

        @apiParam {Integer} user_id 用户ID
        @apiParam {String} tag 用户组标签

        @apiParamExample {json} Request-Example
            {
                "user_id": 1,
                "tag": "Lab#2016"
            }

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(user_id=fparams.user_id, is_activated=True).first()

        if not user:
            raise response.ResponseException

        year, group_id = controller.UpdateUserInfo.get_user_group_from_raw(self, fparams.tag)

        if self.session.query(exists().where(and_(UserGroup.user_id == user.user_id, UserGroup.year == year))).scalar():
            raise response.ResponseException("该用户已有该年标签")
        elif len(user.user_groups) > constants.MemberConfig.MAX_GROUP_LABEL_SUM:
            raise response.ResponseException("组别个数不能超过{}个".format(constants.MemberConfig.MAX_GROUP_LABEL_SUM))
        else:
            ug = UserGroup(user.user_id, group_id, year)
            self.session.add(ug)

        self.session.commit()
        return {"message": "ok"}


class GroupMemberDeleteHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("user_id", int),
                Item("tag", str),
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/ug/delete 删除用户组标签
        @apiVersion 0.1.0
        @apiName UgDelete
        @apiGroup Admin
        @apiPermission root

        @apiDescription 删除用户在某年的组别标签

        @apiParam {Integer} user_id 用户ID
        @apiParam {String} tag 用户组标签

        @apiParamExample {json} Request-Example
            {
                "user_id": 1,
                "tag": "Lab#2016"
            }

        @apiUse MessageFail
        """
        tag_tuple = util.get_group_tuple(fparams.tag)
        if not tag_tuple:
            raise response.ResponseException

        group_name, year = tag_tuple
        group_id = self.session.query(Group.group_id).filter_by(group_name=group_name).scalar()

        if not group_id:
            raise response.ResponseException

        # delete
        ug = self.session.query(UserGroup).filter_by(user_id=fparams.user_id, group_id=group_id, year=year).first()
        if not ug:
            raise response.ResponseException("该标签不存在")
        else:
            self.session.delete(ug)

        self.session.commit()
        return {"message": "ok"}


class GroupMemberHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    def get(self):
        """
        @api {get} /admin/ug [分组]获取可操作成员信息
        @apiVersion 0.1.0
        @apiName UgGet
        @apiGroup Admin
        @apiPermission root

        @apiDescription 提供在分组操作中的需要的成员信息

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "year": 2016,
                    "groups": [{
                        "id": 12,
                        "name": "Lab",
                        "members": [{
                            "id": 12,
                            "name": "xxx",
                            "avatar": "",
                            "is_graduated": false
                        }]
                    }]
                }
            }

        @apiUse MessageFail
        """
        current_period = util.get_current_period()
        ugs = self.session.query(UserGroup).filter_by(year=current_period).all()

        groups = {}
        for ug in ugs:
            user_info = {
                "id": ug.user.user_id,
                "name": ug.user.username,
                "avatar": ug.user.avatar,
                "is_graduated": ug.user.is_graduated
            }
            if ug.group.group_id not in groups:
                groups[ug.group.group_id] = {
                    "id": ug.group.group_id,
                    "name": ug.group.group_name,
                    "members": [user_info]
                }
            else:
                groups[ug.group.group_id]["members"].append(user_info)

        return dict(year=current_period, groups=list(groups.values()))
