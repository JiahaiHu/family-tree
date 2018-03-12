# encoding=utf8

from datetime import datetime

import tornado.web
from sqlalchemy import exists

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request
from application.common import response
from application.common import util
from application.models import Group, UserGroup


class GroupCreateHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("name", str),
                Item("year", int, validates=[
                    (lambda k: k > 2000, )
                ], default=0, required=False),
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/group/create 创建组
        @apiVersion 0.1.0
        @apiName GroupCreate
        @apiGroup Admin
        @apiPermission root

        @apiDescription 管理员创建组，创建时间默认为当前周期

        @apiParam {String} name 组名
        @apiParam {Integer} [year] 建立时间

        @apiParamExample {json} Request-Example
            {
                "name": "Lab",
                "year": 2015
            }

        @apiUse MessageFail
        """
        exist = self.session.query(exists().where(Group.group_name == fparams.name)).scalar()
        if exist:
            raise response.ResponseException("该组名已被使用")

        if fparams.year == 0:
            fparams.year = util.get_current_period()

        group = Group(fparams.name, fparams.year, constants.GroupConfig.MAX_END_YEAR)
        self.session.add(group)

        self.session.commit()
        return {"message": "ok"}


class GrouopDeleteHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("name", str),
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/group/delete 删除组
        @apiVersion 0.1.0
        @apiName GroupDelete
        @apiGroup Admin
        @apiPermission root

        @apiDescription 删除条件：当前周期没有成员或者所有成员均已毕业

        @apiParam {String} name 组名

        @apiParamExample {json} Request-Example
            {
                "name": "Lab",
            }

        @apiUse MessageFail
        """
        group = self.session.query(Group).filter_by(group_name=fparams.name).first()
        if not group:
            raise response.ResponseException()

        now = datetime.now()
        year = util.get_current_period(now)

        ugs = self.session.query(UserGroup).filter_by(group_id=group.group_id, year=year).all()
        if len(ugs):
            for ug in ugs:
                if not ug.user.is_graduated:
                    raise response.ResponseException("当前周期仍有成员")

        if len(group.users) == 0:
            # Remove record from db
            self.session.delete(group)
        else:
            group.end_year = year

        self.session.commit()
        return {"message": "ok"}
