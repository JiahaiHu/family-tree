# encoding=utf8

from application.baseview import BaseHandler


class IndexHandler(BaseHandler):

    def get(self):
        self.render("index.html")
