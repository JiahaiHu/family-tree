# encoding=utf8

import tornado.web
import ujson as json
from sqlalchemy import and_

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request
from application.common import response
from application.core import controller
from application.models import User, Activity, user_activity
from application.fmt import render


class ProgramModifyHandler(BaseHandler):

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
        @api {get} /settings/m/program 获取项目信息
        @apiVersion 0.1.0
        @apiName GetProgram
        @apiGroup Program

        @apiParam {String} [key] 用户id，若为空，则查看自己的信息

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": [{
                    "program_id": 1,
                    "title": "title",
                    "year": 2010,
                    "description": "blabla",
                    "logo": "",
                    "image": "",
                    "is_admin": false,
                    "admin_id": 2,
                    "member": [{
                        "username": "name",
                        "user_id": 2,
                        "avatar": ""
                    }]
                }]
            }

        @apiUse MessageFail
        """
        user = render.homepage.get_user(self)
        result = render.homepage.get_program(user)

        return result

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program 修改项目
        @apiVersion 0.1.0
        @apiName ModifyProgram
        @apiGroup Program
        @apiPermission admin

        @apiDescription 管理员修改项目信息，包括时间、标题，项目简介，logo和其他图片

        @apiParam {String} info 用户所填写的项目信息（注意是JSON.stringify的json）
t
        @apiParamExample {json} Request-Example
            {
                "info": {
                    "program_id": 1,
                    "title": "title blabla",
                    "year": 2010,
                    "description": "description blabla",
                    "logo": base64_string[optional],
                    "image": base64_string[optional]
                }
            }

        @apiUse MessageFail
        """
        program_info = fparams.info
        if not program_info.get("program_id") or \
                not program_info.get("year") or \
                not program_info.get("title") or \
                not program_info.get("description"):
            raise response.ResponseException()

        program = self.session.query(Activity).filter_by(activity_id=program_info["program_id"]).first()
        if not program:
            raise response.ResponseException()

        # admin permission
        if program.admin_id != self.current_user:
            raise response.ResponseException()

        if program_info.get("logo"):
            try:
                logo_uri = controller.UpdateProgramInfo.save_logo(program_info.get("logo"))
            except response.ResponseException:
                raise
            except:
                raise response.ResponseException("上传失败！")

            if program.logo:
                controller.UpdateProgramInfo.delete_logo(program.logo)
            program.logo = logo_uri

        if program_info.get("image"):
            try:
                image_uri = controller.UpdateProgramInfo.save_image(program_info.get("image"))
            except response.ResponseException:
                raise
            except:
                raise response.ResponseException("上传失败！")

            if program.image:
                controller.UpdateProgramInfo.delete_image(program.image)
            program.image = image_uri

        program.year = program_info.get("year")
        program.title = program_info.get("title")
        program.description = program_info.get("description")

        self.session.commit()
        return {"message": "ok"}


class ProgramCreateHandler(BaseHandler):

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
        @api {post} /settings/m/program/create 增加项目
        @apiVersion 0.1.0
        @apiName CreateProgram
        @apiGroup Program

        @apiDescription 创建用户的项目信息

        @apiParam {String} info 用户所填写的项目信息（注意是JSON.stringify的json）

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

        @apiParam {Integer} program_id 新增项目id

        @apiUse MessageFail
        """
        program_info = fparams.info
        if not program_info.get("year") or \
                not program_info.get("title") or \
                not program_info.get("description") or \
                not program_info.get("member") or \
                not isinstance(program_info.get("member"), list):
            raise response.ResponseException()

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()
        if len(user.activities) >= constants.MemberConfig.MAX_PROGRAM_SUM:
            raise response.ResponseException("项目总数不能超过{}个".format(constants.MemberConfig.MAX_PROGRAM_SUM))

        if self.current_user not in program_info["member"]:
            raise response.ResponseException("项目成员必须含有填写人")

        # add new program

        logo_uri = image_uri = None
        logo_str = program_info.get("logo", "")
        if logo_str:
            logo_uri = controller.UpdateProgramInfo.save_logo(logo_str)

        image_str = program_info.get("image", "")
        if image_str:
            image_uri = controller.UpdateProgramInfo.save_image(image_str)

        activity = Activity(program_info["title"], program_info["description"], program_info["year"], self.current_user, logo_uri, image_uri)
        self.session.add(activity)
        for user_id in program_info["member"]:
            partner = self.session.query(User).filter_by(user_id=user_id, is_activated=True).first()
            if not partner:
                raise response.ResponseException()
            else:
                partner.activities.append(activity)

        self.session.commit()
        return {"message": "ok", "program_id": activity.activity_id}


class ProgramDeleteHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("program_id", int, validates=[
                    (lambda k: k > 0, )
                ])
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program/delete 删除项目
        @apiVersion 0.1.0
        @apiName DeleteProgram
        @apiGroup Program

        @apiDescription 删除用户的项目信息

        @apiParam {Integer} program_id 项目ID

        @apiUse MessageFail
        """
        program = self.session.query(Activity).filter_by(activity_id=fparams.program_id).first()
        if not program:
            raise response.ResponseException()

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()
        if program not in user.activities:
            raise response.ResponseException()

        if program.admin_id == self.current_user:
            self.session.delete(program)

            if program.logo:
                controller.UpdateProgramInfo.delete_logo(program.logo)

            if program.image:
                controller.UpdateProgramInfo.delete_image(program.image)
        else:
            user.activities.remove(program)

        self.session.commit()
        return {"message": "ok"}


class ProgramModifyDevolveHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("user_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
                Item("program_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program/devolve 移交管理员
        @apiVersion 0.1.0
        @apiName DevolveProgram
        @apiGroup Program
        @apiPermission admin

        @apiParam {String} user_id 新的管理员id，必须为原项目成员
        @apiParam {Integer} program_id 项目ID

        @apiParamExample {json} Request-Example
            {
                "program_id": 1,
                "user_id": 1
            }

        @apiUse MessageFail
        """
        program = self.session.query(Activity).filter_by(activity_id=fparams.program_id).first()
        if not program:
            raise response.ResponseException()

        # admin permission
        if self.current_user != program.admin_id:
            raise response.ResponseException()

        relation = self.session.query(user_activity)\
            .filter(and_(user_activity.c.user_id == fparams.user_id, user_activity.c.activity_id == fparams.program_id)).first()
        if not relation:
            raise response.ResponseException("用户不在项目组中")

        program.admin_id = fparams.user_id

        self.session.commit()
        return {"message": "ok"}


class ProgramMemberUpdateHandler(BaseHandler):

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
        @api {post} /settings/m/program/member/update 修改项目成员
        @apiVersion 0.1.0
        @apiName ProgramMemberUpdate
        @apiGroup Program

        @apiDescription 一次更新项目组的成员，其中普通成员拥有增加成员的权限，管理员另外有删除成员的权限

        @apiParam {String} info 用户所填写的项目信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "program_id": 1,
                    "member": [1, 2, 3]
                }
            }

        @apiUse MessageFail
        """
        info = fparams.info
        self._check_args(info)

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()
        program = self.session.query(Activity).filter_by(activity_id=info["program_id"]).first()

        if user not in program.users:
            raise response.ResponseException("你不在此项目中")

        users = {u.user_id: u for u in program.users}
        u_to_added = set(info["member"]) - set(users.keys())
        u_to_deleted = set(users.keys()) - set(info["member"])

        for user_id in u_to_added:
            u = self.session.query(User).filter_by(user_id=user_id, is_activated=True).first()
            if not u:
                raise response.ResponseException
            users[user_id] = u

        if u_to_deleted:
            if self.current_user != program.admin_id:
                raise response.ResponseException("没有移除成员权限")
            elif self.current_user in u_to_deleted:
                raise response.ResponseException("不能移除管理员")

        for user_id in u_to_deleted:
            program.users.remove(users[user_id])

        for user_id in u_to_added:
            program.users.append(users[user_id])

        self.session.commit()
        return {"message": "ok"}

    def _check_args(self, info):
        if "program_id" not in info:
            raise response.ResponseException

        if "member" not in info or not isinstance(info["member"], list):
            raise response.ResponseException


class ProgramMemberCreateHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("user_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
                Item("program_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program/member/create 添加项目成员
        @apiVersion 0.1.0
        @apiName ProgramMemberCreate
        @apiGroup Program

        @apiParam {String} user_id 用户ID
        @apiParam {Integer} program_id 项目ID

        @apiParamExample {json} Request-Example
            {
                "program_id": 1,
                "user_id": 1
            }

        @apiUse MessageFail
        """
        program = self.session.query(Activity).filter_by(activity_id=fparams.program_id).first()
        if not program:
            raise response.ResponseException()

        partner = self.session.query(User).filter_by(user_id=fparams.user_id, is_activated=True).first()
        if not partner:
            raise response.ResponseException()

        program.users.append(partner)

        self.session.commit()
        return {"message": "ok"}


class ProgramMemberDeleteHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("user_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
                Item("program_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program/member/delete 删除项目成员
        @apiVersion 0.1.0
        @apiName ProgramMemberDelete
        @apiGroup Program
        @apiPermission admin

        @apiParam {String} user_id 用户ID
        @apiParam {Integer} program_id 项目ID

        @apiParamExample {json} Request-Example
            {
                "program_id": 1,
                "user_id": 1
            }

        @apiUse MessageFail
        """
        program = self.session.query(Activity).filter_by(activity_id=fparams.program_id).first()
        if not program:
            raise response.ResponseException()

        if self.current_user != program.admin_id:
            raise response.ResponseException()

        partner = self.session.query(User).filter_by(user_id=fparams.user_id, is_activated=True).first()
        if not partner:
            raise response.ResponseException()

        if partner not in program:
            raise response.ResponseException("该成员已退出项目组")

        program.users.remove(partner)

        self.session.commit()
        return {"message": "ok"}


class ProgramMemberExitHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("program_id", int, validates=[
                    (lambda k: k > 0, )
                ]),
            ]
        }

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /settings/m/program/member/exit 退出项目
        @apiVersion 0.1.0
        @apiName ProgramMemberExist
        @apiGroup Program

        @apiParam {Integer} program_id 项目ID

        @apiParamExample {json} Request-Example
            {
                "program_id": 1,
            }

        @apiUse MessageFail
        """
        program = self.session.query(Activity).filter_by(activity_id=fparams.program_id).first()
        if not program:
            raise response.ResponseException()

        if self.current_user == program.admin_id:
            raise response.ResponseException("管理员不能直接退出项目！")

        user = self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).first()

        if user not in program.users:
            raise response.ResponseException("您已退出项目组")

        program.users.remove(user)

        self.session.commit()
        return {"message": "ok"}
