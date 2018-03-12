# encoding=utf8

import logging

import tornado.options
import tornado.ioloop

from application import Application
import application.settings  # noqa


def main():
    app = Application()
    app.listen(tornado.options.options.port)
    logging.info("Listening on 127.0.0.1:{}...".format(tornado.options.options.port))
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()
