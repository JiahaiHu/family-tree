# encoding=utf8

import logging

import redis
import ujson as json
import tornado.web
from sqlalchemy import exists
from tornado.options import options
from tornado.httpclient import AsyncHTTPClient

from application.models import User, InvCode
from application.common import request, response, util, email
from application.common.filtration import filtration, Item
from application.baseview import BaseHandler
from application.constants import MailConfig


class IndexHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.html_response
    def get(self):
        self.render("inv_code.html")


class InvCodeCreateHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("total", int, validates=[
                    (lambda k: k > 0, )
                ])
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /admin/inv_code/create 生成邀请码
        @apiVersion 0.1.0
        @apiName InvCodeCreate
        @apiGroup InvCode
        @apiPermission root

        @apiDescription 生成邀请码，支持批量生成

        @apiParam {Integer} total 需要生成的邀请码数量
        返回结果：生成的邀请码

        @apiParamExample {json} Request-Example
            {
                "total": 1
            }

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "inv_codes": ["xxx"]
                }
            }

        @apiUse MessageFail
        """
        result = []
        for _ in range(fparams.total):
            inv_code = util.generate_inv_code()
            while self.session.query(InvCode).filter_by(code=inv_code).first():
                inv_code = util.generate_inv_code()
            result.append(inv_code)
            self.session.add(InvCode(inv_code))
        self.session.commit()
        return dict(inv_codes=result)


class InvCodeQueryHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("type_", str),
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /admin/inv_code 查询邀请码
        @apiVersion 0.1.0
        @apiName InvCodeQuery
        @apiGroup InvCode
        @apiPermission root

        @apiDescription 管理员查看邀请码相关数据

        @apiParam {String} type_ ["used"|"unused"|"sent"|"unsent"|"marked"|"unmarked"|"*"]

        @apiParamExample {json} Request-Example
            {
                "type_": "used"
            }

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "inv_codes": [
                        {
                            "inv_code": "0f7a4d84",
                            "is_marked": false,
                            "inv_id": 1,
                            "is_sent": false,
                            "to_email": "test1@qq.com",
                            "is_used": true,
                            "created_time": "1473915895"
                        }
                    ]
                }
            }

        @apiUse MessageFail
        """
        if fparams.type_ == "used":
            inv_codes = self.session.query(InvCode).filter_by(is_used=True).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "unused":
            inv_codes = self.session.query(InvCode).filter_by(is_used=False).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "sent":
            inv_codes = self.session.query(InvCode).filter(InvCode.to_email.isnot(None)).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "unsent":
            inv_codes = self.session.query(InvCode).filter(InvCode.to_email.is_(None)).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "marked":
            inv_codes = self.session.query(InvCode).filter_by(is_marked=True).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "unmarked":
            inv_codes = self.session.query(InvCode).filter_by(is_marked=False).order_by(InvCode.inv_id.desc()).all()
        elif fparams.type_ == "*":
            inv_codes = self.session.query(InvCode).order_by(InvCode.inv_id.desc()).all()
        else:
            raise response.ResponseException("inv_code查询参数错误")

        result = [{
            "inv_id": inv_code.inv_id,
            "inv_code": inv_code.code,
            "is_used": inv_code.is_used,
            "is_sent": inv_code.to_email is not None,
            "to_email": inv_code.to_email,
            "is_marked": inv_code.is_marked,
            "created_time": inv_code.created_time
        } for inv_code in inv_codes]

        return dict(inv_codes=result)


class InvCodeMarkToggleHandler(BaseHandler):

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
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /admin/inv_code/toggle 邀请码标记toggle
        @apiVersion 0.1.0
        @apiName InvCodeMarkToggle
        @apiGroup InvCode
        @apiPermission root

        @apiDescription 管理员可以自由更改邀请码的一个两态的标记，调用一次接口则翻转相应的状态，
        可以用作管理员标记邀请码。返回结果：成功修改的邀请码数量、状态成功修改的邀请码以及其相关状态

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "inv_ids": [1]
                }
            }

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "total": 1,
                    "inv_codes": [{
                        "inv_id": 1,
                        "is_marked": true
                    }]
                }
            }

        @apiUse MessageFail
        """
        result = []
        for inv_id in fparams.info["inv_ids"]:
            inv_code = self.session.query(InvCode).filter_by(inv_id=inv_id).first()
            if inv_code:
                inv_code.is_marked = not inv_code.is_marked
                result.append(dict(inv_id=inv_code.inv_id, is_marked=inv_code.is_marked))
        self.session.commit()
        return dict(inv_codes=result, total=len(result))


class InvCodeDeleteHandler(BaseHandler):

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
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /admin/inv_code/delete 删除邀请码
        @apiVersion 0.1.0
        @apiName InvCodeDelete
        @apiGroup InvCode
        @apiPermission root

        @apiDescription 管理员可以删除邀请码之后，邀请码将变为不可用（不可撤销操作），
        若邀请码已被使用，则不能删除。返回结果：成功删除的邀请码数量

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "inv_codes": [1]
                }
            }

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {
                    "total": 1
                }
            }

        @apiUse MessageFail
        """
        total = 0
        for inv_code_ in fparams.info["inv_codes"]:
            inv_code = self.session.query(InvCode).filter_by(code=inv_code_).first()
            if inv_code:
                if inv_code.is_used:
                    raise response.ResponseException("邀请码已被使用，不能删除")
                logging.info("[admin]del inv_code id: %s, inv_code: %s" % (inv_code.inv_id, inv_code.code))
                self.session.delete(inv_code)
                total += 1
        self.session.commit()
        return dict(total=total)


class InvCodeSendHandler(BaseHandler):

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
    @request.admin_logined
    @filtration("post")
    @tornado.web.asynchronous
    @response.async_json_response
    def post(self, fparams):
        """
        @api {post} /admin/inv_code/send 发送邀请码
        @apiVersion 0.1.0
        @apiName InvCodeSend
        @apiGroup InvCode
        @apiPermission root

        @apiDescription 管理员可以发送邀请码给指定邮箱（不能为已注册邮箱），邀请码为可选参数，
        如果有邀请码则将相应的邀请码发送给制定的邮箱，没有的话系统自动生成一个邀请码然后再发送。
        返回结果：成功发送邀请码的邮箱总数

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "mail_list": [{
                        "address": "admin@qq.com",
                        "inv_code": "xxx"
                    }, {
                        "address": "test_1@qq.com"
                    }]
                }
            }

        @apiSuccessExample {json} Response-Example
            {
                "status": true,
                "message": {}
            }

        @apiUse MessageFail
        """
        for mail in fparams.info["mail_list"]:
            # validate email
            if self.session.query(exists().where(User.email == mail["address"])).scalar():
                raise response.ResponseException("该邮箱已注册")

            # generate inv_code if not provided
            if "inv_code" not in mail:
                inv_code = util.generate_inv_code()
                while self.session.query(InvCode).filter_by(code=inv_code).first():
                    inv_code = util.generate_inv_code()
                self.session.add(InvCode(inv_code, to_email=mail["address"]))
                mail["inv_code"] = inv_code
            else:
                inv_code = self.session.query(InvCode).filter_by(code=mail["inv_code"]).first()
                if not inv_code or inv_code.is_used or inv_code.to_email:
                    raise response.ResponseException("该验证码(%s)无效或已被使用" % (mail["inv_code"]))
                inv_code.to_email = mail["address"]

        self.session.commit()

        to_list = []
        sub_inv_code_list = []
        sub_url_list = []
        for mail in fparams.info["mail_list"]:
            to_list.append(mail["address"])
            sub_inv_code_list.append(mail["inv_code"])
            sub_url_list.append(options.base_url + options.homepage_url)
        req = email.request_gen(
            to_list,
            MailConfig.MAIL_MAP[MailConfig.INVITE_TYPE_STR]["template_name"],
            inv_code=sub_inv_code_list,
            url=sub_url_list
        )
        logging.info("发送邀请邮件, sent %s to %s" % (sub_inv_code_list, to_list))
        AsyncHTTPClient().fetch(req, self._on_callback)

    def _on_callback(self, res):
        s = res.body.decode("utf8")
        logging.info(s)
        if "true" in s:
            self.write(json.dumps({"status": True, "message": "ok"}))
        else:
            r = redis.Redis(connection_pool=options.redis_pool)
            r.lpush(MailConfig.MAIL_MAP[MailConfig.INVITE_TYPE_STR]["failed_list"], s)
            self.write(json.dumps({"status": False, "error": s}))
        self.finish()
