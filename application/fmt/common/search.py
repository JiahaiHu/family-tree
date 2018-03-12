# encoding=utf8

from sqlalchemy import and_

from application.baseview import BaseHandler
from application.common.filtration import filtration, Item
from application.common import response
from application.models import User


class SearchMemberHandler(BaseHandler):
    def get_validation_args(self):
        return {
            "post": [
                Item("keyword", str, validates=[
                    (lambda k: "_" not in k and "%" not in k,)
                ])
            ]
        }

    @response.json_response
    @filtration("post")
    def post(self, fparams):
        """
        @api {post} /common/search/member 搜索用户
        @apiVersion 0.1.0
        @apiName SearchMember
        @apiGroup Common

        @apiParam {String} keyword 不能含有'_'、'%'等特殊字符，否则直接报参数错误, "#"代表不存在任何组中

        @apiSuccessExample {json} Success-Example
        {
            "status": true,
            "message": {
                "#": [
                    {
                        "username": "test2",
                        "user_id": 2,
                        "avatar": ""
                    },
                    {
                        "username": "test3",
                        "user_id": 3,
                        "avatar": ""
                    }
                ],
                "Lab": [
                    {
                        "username": "test1",
                        "user_id": 1,
                        "avatar": "/upload/avatar/c20272c3b6d1121d2626e4e5eeb42ab7.png"
                    }
                ]
            }
        }

        @apiUse MessageFail
        """
        users = self.session.query(User).filter(and_(User.username.like("%" + fparams.keyword + "%"), User.is_activated == True)).all()
        print("search", users)
        result = {}
        for user in users:
            groups = sorted(user.user_groups, key=lambda x: x.year, reverse=True)
            group_name = groups[0].group.group_name if groups else "#"
            if group_name in result:
                result[group_name].append({
                    "username": user.username,
                    "avatar": user.avatar if user.avatar else "",
                    "user_id": user.user_id,
                })
            else:
                result[group_name] = [{
                    "username": user.username,
                    "avatar": user.avatar if user.avatar else "",
                    "user_id": user.user_id,
                }]
        return result
