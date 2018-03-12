# encoding=utf8

import logging

import tornado.web
import ujson as json

from application import constants
from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import request, response, util
from application.models import Group, GroupRelation, UserGroup


class GroupMergeHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("info", str, validates=[
                    (lambda k: json.decode(k), )
                ], uses=[
                    (lambda k: json.decode(k), )
                ])
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/group/merge 合组
        @apiVersion 0.1.0
        @apiName GroupMerge
        @apiGroup Admin
        @apiPermission root

        @apiDescription 将多个组合并为一个组，需将year设置为当前周期或者下一个周期

        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "before": ["IT", "ESD", "Alg"],
                    "after": "Lab",
                    "year": 2015
                }
            }

        @apiUse MessageFail
        """
        info = fparams.info
        self._check_merge_info(info)
        current_period = util.get_current_period()

        group_merged = set()
        for group_name in info["before"]:
            group = self.session.query(Group).filter_by(group_name=group_name).first()
            if not group or (group.end_year != constants.GroupConfig.MAX_END_YEAR and group.end_year < current_period):
                logging.info("{group} not exist or merged".format(group=group_name))
                raise response.ResponseException
            else:
                group_merged.add(group.group_id)

        new_group = self.session.query(Group.group_id).filter_by(group_name=info["after"]).limit(1).scalar()
        if not new_group:
            new_group = Group(info["after"], current_period, constants.GroupConfig.MAX_END_YEAR)
            self.session.add(new_group)
            self.session.flush()
            new_group = new_group.group_id

        for group_id in group_merged:
            if group_id != new_group:
                self.session.query(Group).filter_by(group_id=group_id).update({"end_year": current_period})
                gr = GroupRelation(group_id, new_group, info["year"])
                self.session.add(gr)
                if info["year"] == current_period:
                    self.session.query(UserGroup).filter_by(group_id=group_id, year=current_period).update({"group_id": new_group})

        logging.info("Merge groups: " + str(fparams))
        self.log_request_headers()

        self.session.commit()
        return {"message": "ok"}

    def _check_merge_info(self, info):
        fields = ["before", "after", "year"]
        for field in fields:
            if field not in info or not info[field]:
                raise response.ResponseException

        if not isinstance(info["before"], list):
            raise response.ResponseException

        info["year"] = util.validate_year(info["year"])
        if not info["year"] or info["year"] not in util.get_year_options():
            print(info["year"], util.get_year_options())
            raise response.ResponseException


class GroupBranchHandler(BaseHandler):

    def get_validation_args(self):
        return {
            "post": [
                Item("info", str, validates=[
                    (lambda k: json.decode(k), )
                ], uses=[
                    (lambda k: json.decode(k), )
                ])
            ]
        }

    @tornado.web.authenticated
    @request.admin_logined
    @response.json_response
    @filtration("post")
    def post(self, fparams=None):
        """
        @api {post} /admin/group/branch 分组
        @apiVersion 0.1.0
        @apiName GroupBranch
        @apiGroup Admin
        @apiPermission root

        @apiDescription 将一个组拆分为多个组，
        @apiParam {String} info 用户所填写的信息（注意是JSON.stringify的json）

        @apiParamExample {json} Request-Example
            {
                "info": {
                    "before": "软设",
                    "after": {
                            "Web": [1, 2, 3],
                            "Android": [4],
                            "iOS": [5, 6]
                    }
                    "year": 2010
                }
            }

        @apiUse MessageFail
        """
        info = fparams.info
        self._check_merge_info(info)

        old_group = self.session.query(Group).filter_by(group_name=info["before"]).first()
        if not old_group:
            raise response.ResponseException

        current_period = util.get_current_period()
        new_groups = set()
        for group_name, uid_list in info["after"].items():
            group_id = self.session.query(Group.group_id).filter_by(group_name=group_name).limit(1).scalar()
            if not group_id:
                group = Group(group_name, current_period, constants.GroupConfig.MAX_END_YEAR)
                self.session.add(group)
                self.session.commit()
                group_id = group.group_id
            new_groups.add(group_id)
            if info["year"] == current_period and group_name != info["before"]:
                list(map(lambda user_id: self.session.query(UserGroup).filter_by(user_id=user_id, group_id=old_group.group_id, year=current_period).update({"group_id": group_id}), uid_list))

        for group_id in new_groups:
            if group_id != old_group.group_id:
                gr = GroupRelation(old_group.group_id, group_id, info["year"])
                self.session.add(gr)

        if old_group not in new_groups:
            old_group.end_year = current_period
            logging.info("group(%s) end at %s" % (old_group.group_name, current_period))

        logging.info("Branch groups: %s" % fparams)
        self.session.commit()
        return {"message": "ok"}

    def _check_merge_info(self, info):
        fields = ["before", "after", "year"]
        for field in fields:
            if field not in info or not info[field]:
                raise response.ResponseException

        info["year"] = util.validate_year(info["year"])
        if not info["year"] or info["year"] not in util.get_year_options():
            raise response.ResponseException
