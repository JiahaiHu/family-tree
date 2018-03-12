# encoding=utf8

import logging

from tornado.options import options
from tornado.web import HTTPError


__all__ = ["customer_logined", "admin_logined", "no_logined"]


def customer_logined(method):
    def _wrapper(self, *args, **kwargs):
        if not self.current_user or not self.is_customer() and not self.is_admin():
            logging.info("customer_login limit!")
            if self.request.method in ("GET", "HEAD"):
                self.redirect(options.login_url)
                return
            else:
                raise HTTPError(403)
        else:
            method(self, *args, **kwargs)
    return _wrapper


def admin_logined(method):
    def _wrapper(self, *args, **kwargs):
        if not self.current_user or not self.is_admin():
            logging.info("admin_login limit!")
            if self.request.method in ("GET", "HEAD"):
                self.redirect(options.login_url)
                return
            else:
                raise HTTPError(403)
        method(self, *args, **kwargs)
    return _wrapper


def no_logined(method):
    def _wrapper(self, *args, **kwargs):
        if self.current_user:
            logging.info("no_login limit!")
            if self.request.method in ("GET", "HEAD"):
                self.redirect(options.homepage_url)
                return
            else:
                raise HTTPError(403)
        method(self, *args, **kwargs)
    return _wrapper
