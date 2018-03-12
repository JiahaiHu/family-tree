# encoding=utf8

import logging

import tornado.web
import ujson as json

from application import constants
from application.models import Session


class BaseHandler(tornado.web.RequestHandler):
    """
    @apiDefine MessageFail
    @apiError {Boolean} status false
    @apiError {Object} error 错误原因

    @apiErrorExample {json} Error-Response
        HTTP/1.1 200 OK
        {
            "status": false,
            "error": {...}
        }
    """

    def prepare(self):
        self.session = Session()

    def on_finish(self):
        Session.remove()

    def _decode_cookie_value(self):
        if not hasattr(self, "_user_info"):
            value = self.get_secure_cookie(constants.SiteConfig.SESS_NAME)
            assert value
            self._user_info = json.decode(value)
        return self._user_info

    def get_current_user(self):
        value = self.get_secure_cookie(constants.SiteConfig.SESS_NAME)
        if not value:
            return None
        user_info = self._decode_cookie_value()
        if user_info and user_info.get("user_id"):
            return user_info.get("user_id")

    def is_customer(self):
        user_info = self._decode_cookie_value()
        return user_info.get("permission", "") == constants.MemberConfig.CUSTOMER_PERMISSION

    def is_admin(self):
        user_info = self._decode_cookie_value()
        return user_info.get("permission", "") == constants.MemberConfig.ADMIN_PERMISSION

    def check_basic_info(self):
        user_info = self._decode_cookie_value()
        return user_info.get("is_basic_completed", False)

    def set_logined_status(self, user_id, permission, is_basic_completed, is_activated):
        value = {
            "user_id": user_id,
            "permission": permission,
            "is_basic_completed": is_basic_completed,
            "is_activated": is_activated
        }
        self.set_secure_cookie(
            name=constants.SiteConfig.SESS_NAME,
            value=json.encode(value),
            expires_days=constants.SiteConfig.SESS_EXPIRES_DAYS
        )
        self.set_cookie(
            name=constants.SiteConfig.IBC_NAME,
            value=str(int(is_basic_completed)),
            expires_days=constants.SiteConfig.IBC_EXPIRES_DAYS
        )
        self.set_cookie(
            name=constants.SiteConfig.IA_NAME,
            value=str(int(is_activated)),
            expires_days=constants.SiteConfig.IA_EXPIRES_DAYS
        )

    def log_request_headers(self):
        logging.info("log request headers: %s" % {k: v for k, v in self.request.headers.get_all()})
