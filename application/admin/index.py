# encoding=utf8

import tornado.web

from application.common import request
from application.common import response
from application.baseview import BaseHandler


class IndexHandler(BaseHandler):

    @tornado.web.authenticated
    @request.admin_logined
    @response.html_response
    def get(self):
        self.render("admin.html")
