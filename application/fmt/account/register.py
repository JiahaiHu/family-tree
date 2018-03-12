# encoding=utf8

import logging

import redis
import ujson as json
from tornado.web import asynchronous
from tornado.options import options
from tornado.httpclient import AsyncHTTPClient

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item, Helper
from application.common import request
from application.common import response
from application.common import util
from application.common import email
from application.models import User, InvCode
from application.constants import MailConfig


class RegisterHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("username", str),
                Item("email", str, validates=[
                    (Helper.is_valid_email_address, None, "邮箱非法"),
                ]),
                Item("password", str, validates=[
                    (Helper.is_valid_password, None, "密码长度应在6~16位之间"),
                ]),
                Item("inv_code", str, err_message="请输入邀请码")
            ]
        }

    @request.no_logined
    @response.html_response
    def get(self):
        # TODO
        self.write("[TODO] register page")

    @request.no_logined
    @filtration("post")
    @asynchronous
    @response.async_json_response
    def post(self, fparams=None):
        """
        @api {post} /account/register 注册
        @apiVersion 0.1.0
        @apiName Register
        @apiGroup Account

        @apiDescription 注册，成功则status为true

        @apiParam {String} username 用户名
        @apiParam {String} email 邮箱
        @apiParam {String} password 密码（密码长度应在6~16位之间）
        @apiParam {String} inv_code 邀请码（8位）

        @apiSuccessExample {json} Success-Response
            HTTP/1.1 200 OK
            {
                "status": true,
                "message": ...,
                "state": integer(0: success; 1: succeed to send validation email; 2: fail to send email)
            }

        @apiUse MessageFail

        """
        inv_code = self.session.query(InvCode).filter_by(code=fparams.inv_code).first()
        if not inv_code or inv_code.is_used:
            raise response.ResponseException("邀请码错误或已被使用")

        user_registered = self.session.query(User).filter_by(email=fparams.email).first()
        if user_registered and user_registered.is_activated:
            raise response.ResponseException("该邮箱已注册")

        if user_registered:
            logging.info("overide registered user, email: %s" % fparams.email)
            user_registered.password = util.generate_password(fparams.password)
            user = user_registered
        else:
            logging.info("create new account, email: %s" % fparams.email)
            user = User(fparams.username, fparams.email, util.generate_password(fparams.password))
            self.session.add(user)

        user.inv_id = inv_code.inv_id
        print(user, user.email)
        self.session.flush()

        # if email registered the same with address which received inv_code
        # then skip email address validating
        if inv_code.to_email != fparams.email:
            req = GenerateActivateURLHandler.generate_activate_email_req(fparams.email)
            AsyncHTTPClient().fetch(req, self._on_callback)
        else:
            user.is_activated = True
            logging.info("skip register email validation: %s" % fparams.email)
            self.write(json.dumps({"status": True, "message": "ok", "state": 0}))
            self.session.commit()
            self.finish()

    def _on_callback(self, res):
        result_body = res.body.decode("utf8")
        logging.info(result_body)

        if "true" in result_body:
            self.write({"status": True, "message": "ok", "state": 1})
        else:
            r = redis.Redis(connection_pool=options.redis_pool)
            r.lpush(MailConfig.MAIL_MAP[MailConfig.ACTIVATE_TYPE_STR]["failed_list"], result_body)
            self.write({"status": True, "message": "ok", "state": 2})

        self.session.commit()
        self.finish()


class GenerateActivateURLHandler(BaseHandler):

    @staticmethod
    def generate_activate_email_req(address):
        r = redis.Redis(connection_pool=options.redis_pool)

        ttl = r.ttl(util.generate_activate_token_map(address))
        if ttl > 0 and \
                ttl + MailConfig.MAIL_MAP[MailConfig.ACTIVATE_TYPE_STR]["interval_seconds"] \
                > options.redis_token_ex_seconds:
            raise response.ResponseException(
                "发送间隔不能小于 %s s" % MailConfig.MAIL_MAP[MailConfig.ACTIVATE_TYPE_STR]["interval_seconds"]
            )

        activate_token = util.random_str()
        activate_url = util.get_activate_url(activate_token)
        pipe = r.pipeline()

        old_token = r.get(util.generate_activate_token_map(address))
        if old_token:
            logging.info("expire old activate token, old_token: %s" % old_token)
            pipe.delete(old_token)

        pipe.set(util.generate_activate_token(activate_token), address, options.redis_token_ex_seconds)
        pipe.set(util.generate_activate_token_map(address),
                 util.generate_activate_token(activate_token),
                 options.redis_token_ex_seconds)
        pipe.execute()

        req = email.request_gen(
            address,
            MailConfig.MAIL_MAP[MailConfig.ACTIVATE_TYPE_STR]["template_name"],
            url=activate_url
        )
        logging.info("发送邮箱验证邮件，url: %s, to: %s" % (activate_url, address))
        return req

    def get_validation_args(self):
        return {
            "post": [
                Item("email", str, validates=[
                    (Helper.is_valid_email_address, None, "邮箱非法"),
                ])
            ]
        }

    @request.no_logined
    @filtration("post")
    @asynchronous
    @response.async_json_response
    def post(self, fparams=None):
        """
        @api {post} /account/email/validate
        @apiVersion 0.1.0
        @apiName GenerateActivateURL
        @apiGroup Account

        @apiDescription 发送邮箱验证邮件。
        发送条件：1、邮箱未注册。2、邮箱未激活。3、距离上一次发送验证邮件 60 s
        返回结果：成功则status为true

        @apiParam {String} email 邮箱

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(email=fparams.email).first()
        if not user:
            raise response.ResponseException("该邮箱尚未注册")

        if user.is_activated:
            raise response.ResponseException("该邮箱已通过验证")

        req = GenerateActivateURLHandler.generate_activate_email_req(fparams.email)
        AsyncHTTPClient().fetch(req, self._on_callback)

    def _on_callback(self, res):
        result_body = res.body.decode("utf8")
        logging.info(result_body)

        if "true" in result_body:
            self.write({"status": True, "message": "ok"})
        else:
            r = redis.Redis(connection_pool=options.redis_pool)
            r.lpush(MailConfig.MAIL_MAP[MailConfig.ACTIVATE_TYPE_STR]["failed_list"], result_body)

        self.finish()


class ActivateHandler(BaseHandler):

    @response.html_response
    def get(self, activate_token):
        r = redis.Redis(connection_pool=options.redis_pool)
        user_email = r.get(util.generate_activate_token(activate_token))
        if not user_email:
            raise response.ResponseException("链接非法或已失效")

        user = self.session.query(User).filter_by(email=user_email).first()
        if not user or user.inv_code.is_used:
            raise response.ResponseException("链接已失效")

        user.is_activated = True
        if user.is_root:
            permission = constants.MemberConfig.ADMIN_PERMISSION
        else:
            permission = constants.MemberConfig.CUSTOMER_PERMISSION
        self.set_logined_status(user.user_id, permission, user.is_basic_completed, user.is_activated)

        user.inv_code.is_used = True

        redirect_uri = options.homepage_url
        if not user.is_basic_completed:
            redirect_uri = "/#/important_info"

        self.session.commit()
        self.render("activate.html", status=True, redirect_uri=redirect_uri)
