# encoding=utf8

import functools
import logging
import traceback

import ujson as json

from application.common.filtration import FiltrationException


class ResponseException(Exception):
    def __init__(self, message=None):
        super(ResponseException, self).__init__(message)
        self.error = message


def html_response(method):
    @functools.wraps(method)
    def _wrapper(self, *args, **kwargs):
        try:
            return method(self, *args, **kwargs)
        except (FiltrationException, ResponseException) as e:
            if not e.error:
                e.error = "操作非法"
            logging.error(traceback.format_exc())
            self.render("error.html", msg=e.error)
    return _wrapper


def json_response(method):
    @functools.wraps(method)
    def _wrapper(self, *args, **kwargs):
        try:
            message = method(self, *args, **kwargs)
            result = {"status": True, "message": message}
        except (FiltrationException, ResponseException) as e:
            if not e.error:
                e.error = "操作非法"
            logging.error(traceback.format_exc())
            result = {"status": False, "error": e.error}

        self.set_header("Content-Type", "application/json")
        self.write(json.dumps(result))
    return _wrapper


def async_json_response(method):
    @functools.wraps(method)
    def _wrapper(self, *args, **kwargs):
        try:
            message = method(self, *args, **kwargs)
            result = {"status": True, "message": message}
        except (FiltrationException, ResponseException) as e:
            if not e.error:
                e.error = "操作非法"
            logging.error(traceback.format_exc())
            result = {"status": False, "error": e.error}

        self.set_header("Content-Type", "application/json")
        if result.get("message", "") or result.get("error", ""):
            self.write(json.dumps(result))

        if result.get("error", ""):
            self.finish()
    return _wrapper
