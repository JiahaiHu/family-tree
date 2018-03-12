# encoding=utf8

import logging

from tornado.options import options

from application import constants
from application.common import response
from application.common import util
from application.models import User, Group


class UpdateUserInfo(object):

    @staticmethod
    def get_user_group_from_raw(self, tag):
        group_tuple = util.get_group_tuple(tag)
        if not group_tuple:
            raise response.ResponseException("组别信息格式错误")

        group_name, year = group_tuple
        group_id = self.session.query(Group.group_id, Group.start_year, Group.end_year)\
            .filter_by(group_name=group_name).first()
        if not group_id:
            raise response.ResponseException("该组不存在")

        group_id, start_year, end_year = group_id
        if year < start_year or (end_year != constants.GroupConfig.MAX_END_YEAR and year > end_year):
            logging.info("wrong year: params: {} {} {}".format(year, start_year, end_year))
            raise response.ResponseException("年份信息错误")

        return year, group_id

    @staticmethod
    def get_user_mentor_from_raw(self, user, fparams):
        assert isinstance(user, User)

        mentors = fparams.info.get("mentors")
        if not mentors or not isinstance(mentors, list):
            raise response.ResponseException("mentor信息格式错误")

        # get new mentors
        mentor_info_transcations = set()
        for mentor in mentors:
            user_id = self.session.query(User.user_id).filter_by(user_id=mentor, is_activated=True).first()
            if not user_id:
                raise response.ResponseException("mentor信息错误")
            else:
                mentor_info_transcations.add(mentor)

        return mentor_info_transcations

    @staticmethod
    def save_avatar(self, raw_str):
        avatar_uri = util.save_img(options.avatar_path, options.avatar_base_url, raw_str)
        self.session.query(User).filter_by(user_id=self.current_user, is_activated=True).update({"avatar": avatar_uri})

    @staticmethod
    def delete_avatar(self, user):
        assert user.avatar
        util.delete_img(options.avatar_path, user.avatar)
