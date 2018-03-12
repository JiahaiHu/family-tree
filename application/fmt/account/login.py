# encoding=utf8

from tornado.options import options

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item, Helper
from application.common import request
from application.common import response
from application.common import util
from application.models import User


class LoginHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("email", str, validates=[
                    (Helper.is_valid_email_address, None, "邮箱非法"),
                ]),
                Item("password", str, validates=[
                    (Helper.is_valid_password, None, "密码长度应在6~16位之间"),
                ]),
            ]
        }

    @request.no_logined
    @response.html_response
    def get(self):
        # TODO
        self.write("[TODO] login page")

    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /account/login 登录
        @apiVersion 0.1.0
        @apiName Login
        @apiGroup Account

        @apiDescription 登录

        @apiParam {String} email 邮箱
        @apiParam {String} password 密码（密码长度应在6~16位之间）

        @apiUse MessageFail
        """
        user = self.session.query(User).filter_by(email=fparams.email, is_activated=True).first()

        if not user:
            raise response.ResponseException("没有该帐号")
        else:
            if not util.is_correct_password(fparams.password, user.password):

                raise response.ResponseException("密码错误")
            else:
                if user.is_root:
                    permission = constants.MemberConfig.ADMIN_PERMISSION
                else:
                    permission = constants.MemberConfig.CUSTOMER_PERMISSION
                self.set_logined_status(user.user_id, permission, user.is_basic_completed, user.is_activated)

                if user.is_basic_completed:
                    redirect_uri = "fillin_uri"
                else:
                    redirect_uri = "homepage_url"
                return {"redirect_uri": redirect_uri, "user_id": user.user_id}


class LogoutHandler(BaseHandler):

    def get(self):
        """
        @api {get} /account/logout 注销
        @apiVersion 0.1.0
        @apiName Logout
        @apiGroup Account

        @apiDescription 注销
        """
        if self.current_user:
            self.clear_all_cookies()
        self.redirect(options.login_url)
