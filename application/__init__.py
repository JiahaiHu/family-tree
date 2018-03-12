# encoding=utf8

import tornado.web

from tornado.options import options

import application.settings  # noqa
from application.urls import urls


class Application(tornado.web.Application):

    def __init__(self):
        application_settings = {
            "debug": options.debug,
            "port": options.port,
            "template_path": options.template_path,
            "static_path": options.static_path,
            "cookie_secret": options.secret_key,
            "xsrf_cookies": False,
            "login_url": options.login_url,
        }

        tornado.web.Application.__init__(self, urls, **application_settings)
