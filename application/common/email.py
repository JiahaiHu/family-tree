# encoding=utf8

import urllib.request, urllib.parse, urllib.error
import logging

import ujson as json

from tornado.httpclient import HTTPRequest
from tornado.options import options

from application.constants import MailConfig


def convert_to_list(data):
    if not isinstance(data, list):
        return [data]
    return data


def request_gen(to_list, template_name, **kwargs):
    assert to_list
    xsmtpapi = dict(to=convert_to_list(to_list))
    if kwargs:
        xsmtpapi["sub"] = {
            "%%%s%%" % k: convert_to_list(v) for k, v in kwargs.items()
        }
        logging.info("xsmtpapi['sub']: %s" % xsmtpapi["sub"])

    params = {
        "apiUser": options.mail_api_user,
        "apiKey": options.mail_api_key,
        "from": MailConfig.FROM,
        "fromname": MailConfig.FROM_NAME,
        "templateInvokeName": template_name,
        "xsmtpapi": json.dumps(xsmtpapi),
    }
    request = HTTPRequest(MailConfig.TEMPLATE_URL, "POST", body=urllib.parse.urlencode(params))
    return request
