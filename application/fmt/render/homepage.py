# encoding=utf8

import logging

import tornado.web

from application.baseview import BaseHandler
from application.common import request, util
from application.common import response
from application.models import User


def get_user(r):
    key = r.get_query_argument("user_id", "")
    if key:
        user = r.session.query(User).filter_by(user_id=key).first()
    else:
        user = r.session.query(User).filter_by(user_id=r.current_user).first()

    if not user:
        # deal with wrong session
        if not key:
            logging.error("illegal cookies, user_id: %s" % r.current_user)
            r.log_request_headers()
            r.clear_all_cookies()

        raise response.ResponseException

    return user


def get_personal(user):
    result = {
        "user_id": user.user_id,
        "username": user.username,
        "avatar": user.avatar,
        "email": user.email,
        "blog": user.blog,
        "wechat_id": user.wechat_id,
        "location": user.location,
        "is_graduated": user.is_graduated
    }

    return result


def get_group(user):
    result = []
    ugs = sorted(user.user_groups, key=lambda ug: ug.year)
    for ug in ugs:
        result.append("%s#%s" % (ug.group.group_name, ug.year))

    # get last group_id
    last_group_id = 0 if len(ugs) == 0 else ugs[len(ugs)-1].group_id

    return result, last_group_id


def get_mentor_mentee(user):
    result = {}

    result["mentors"] = [{
        "username": u.username,
        "avatar": u.avatar,
        "user_id": u.user_id,
    } for u in user.mentors]
    result["mentees"] = [{
        "username": u.username,
        "avatar": u.avatar,
        "user_id": u.user_id,
    } for u in user.mentees]

    return result


def get_program(user):
    result = []
    for activity in user.activities:
        result.append({
            "title": activity.title,
            "program_id": activity.activity_id,
            "year": activity.year,
            "description": activity.description,
            "logo": activity.logo,
            "image": activity.image,
            "is_admin": activity.admin_id == user.user_id,
            "admin_id": activity.admin_id,
            "member": [{
                "username": u.username,
                "user_id": u.user_id,
                "avatar": u.avatar
            } for u in activity.users]
        })

    return result


class HomepageRenderHandler(BaseHandler):

    @tornado.web.authenticated
    @request.customer_logined
    @response.json_response
    def get(self):
        """
        @api {get} /render/homepage 获取个人主页信息
        @apiVersion 0.1.0
        @apiName RenderHomepage
        @apiGroup Render

        @apiDescription 一次获取个人信息、tag、relation、项目

        @apiParam [user_id] 如果有的话则按照这个user_id获取用户信息，否则获取登录用户的信息

        @apiSuccessExample {json} Success-Example
            {
                "status": true,
                "message": {
                    "personal": {
                        "user_id": 1,
                        "username": "test1"
                        "is_graduated": true
                        "blog": "http://www.baidu.com",
                        "wechat_id": null,
                        "location": null,
                        "email": "test@qq.com",
                        "avatar": "/upload/avatar/c20272c3b6d1121d2626e4e5eeb42ab7.png",
                        "last_group_id": 12(>= 0, 0 means null),
                    }
                    "groups": [
                        "ESD#2013",
                        "Lab#2014"
                    ],
                    "relation": {
                        "mentors": [{
                            "username": "name",
                            "avatar": "",
                            "user_id": 3
                        }],
                        "mentees": [{
                            "username": "name",
                            "avatar": "",
                            "user_id": 1
                        }]
                    },
                    "programs": [{
                        "program_id": 1,
                        "title": "title",
                        "year": 2010,
                        "description": "blabla",
                        "logo": "",
                        "image": "",
                        "is_admin": false,
                        "admin_id": 2,
                        "member": [{
                            "username": "name",
                            "user_id": 2,
                            "avatar": ""
                        }]
                    }],
                    "current_period": 2016
                }
            }

        @apiUse MessageFail
        """
        user = get_user(self)
        groups, last_group_id = get_group(user)
        result = {
            "personal": get_personal(user),
            "groups": groups,
            "relation": get_mentor_mentee(user),
            "programs": get_program(user),
            "current_period": util.get_current_period(),
        }
        result["personal"]["last_group_id"] = last_group_id

        return result
