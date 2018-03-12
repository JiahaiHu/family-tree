# encoding=utf8

import logging

import redis
import ujson as json
from tornado.options import options
from tornado.web import gen, asynchronous
from tornado.httpclient import AsyncHTTPClient

from application.baseview import BaseHandler
from application.common.filtration import filtration, Item, Helper
from application.common import request, response, util, email
from application.constants import MailConfig
from application.models import User


class PasswordForgotHandler(BaseHandler):

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
        @api {post} /account/forgot 忘记密码
        @apiVersion 0.1.0
        @apiName PasswordFrogot
        @apiGroup Account

        @apiDescription 忘记密码，往指定的邮箱发送密码重置链接

        @apiParam {String} email 邮箱

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(email=fparams.email, is_activated=True).first()
        if not user:
            raise response.ResponseException("该邮箱地址不存在")

        r = redis.StrictRedis(connection_pool=options.redis_pool)

        ttl = r.ttl(util.generate_password_reset_token_map(fparams.email))

        if ttl > 0 \
                and ttl + MailConfig.MAIL_MAP[MailConfig.RESET_PASSWORD_STR]["interval_seconds"] \
            > options.redis_token_ex_seconds:
            raise response.ResponseException(
                "发送间隔不能小于 %s s" % MailConfig.MAIL_MAP[MailConfig.RESET_PASSWORD_STR]["interval_seconds"]
            )

        reset_token = util.random_str()
        reset_url = util.get_password_reset_url(reset_token)

        pipe = r.pipeline()

        old_token = r.get(util.generate_password_reset_token_map(fparams.email))
        if old_token:
            logging.info("expire old reset token, old_token: %s" % old_token)
            pipe.delete(old_token)

        pipe.set(util.generate_password_reset_token(reset_token),
                 fparams.email, options.redis_token_ex_seconds)
        pipe.set(util.generate_password_reset_token_map(fparams.email),
                 util.generate_password_reset_token(reset_token),
                 options.redis_token_ex_seconds)
        pipe.execute()

        req = email.request_gen(
            fparams.email,
            MailConfig.MAIL_MAP[MailConfig.RESET_PASSWORD_STR]["template_name"],
            url=reset_url
        )

        logging.info("发送密码重置邮件，url: %s, to: %s" % (reset_url, fparams.email))
        AsyncHTTPClient().fetch(req, self._on_callback)

    def _on_callback(self, res):
        result_body = res.body.decode("utf8")
        logging.info(result_body)

        if "true" in result_body:
            self.write(json.dumps({"statue": True, "message": "ok"}))
        else:
            r = redis.StrictRedis(connection_pool=options.redis_pool)
            r.lpush(MailConfig.MAIL_MAP[MailConfig.RESET_PASSWORD_STR]["failed_list"], result_body)
            self.write(json.dumps({"statue": False, "error": result_body}))

        self.finish()


class PasswordResetHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("password", str, validates=[
                    (Helper.is_valid_password, None, "密码长度应在6~16位之间"),
                ])
            ]
        }

    @request.no_logined
    @response.json_response
    @filtration("post")
    def post(self, token, fparams=None):
        """
        @api {post} /account/reset/:token 密码重置
        @apiVersion 0.1.0
        @apiName PassswordReset
        @apiGroup Account

        @apiDescription 密码重置，成功则status为true

        @apiParam {String} password 密码（密码长度应在6~16位之间）

        @apiUse MessageFail
        """
        r = redis.StrictRedis(connection_pool=options.redis_pool)
        user_email = r.get(util.generate_password_reset_token(token))
        if not user_email:
            raise response.ResponseException("链接非法或已经失效")

        user = self.session.query(User).filter_by(email=user_email, is_activated=True).first()
        if not user:
            raise response.ResponseException("链接非法")

        user.password = util.generate_password(fparams.password)
        self.session.commit()
        logging.info("user reset password, account: %s" % user_email)

        return "ok"
