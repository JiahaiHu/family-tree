# encoding=utf8

from tornado.options import options

from application.common import util


class UpdateProgramInfo(object):

    @staticmethod
    def save_logo(raw_str):
        return util.save_img(options.logo_path, options.logo_base_url, raw_str)

    @staticmethod
    def delete_logo(uri):
        util.delete_img(options.logo_path, uri)

    @staticmethod
    def save_image(raw_str):
        return util.save_img(options.common_path, options.common_base_url, raw_str)

    @staticmethod
    def delete_image(uri):
        util.delete_img(options.common_path, uri)
