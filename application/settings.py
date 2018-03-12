# encoding=utf8

import os

import redis
from tornado.options import define, options, parse_config_file


base_path = os.path.dirname(__file__)
upload_path = os.path.join(base_path, "upload")

define("port", default=23400)
define("debug", default=True)
define("secret_key", default="__ZHANGYU__")
define("sql_echo", default=False)

define("base_url", default="http://127.0.0.1:8600")
define("login_url", default="/#/")
define("homepage_url", default="/#/")
define("avatar_base_url", default="/upload/avatar")
define("logo_base_url", default="/upload/logo")
define("common_base_url", default="/upload/common")
define("activate_base_url", default="/account/activate/")
define("password_reset_base_url", default="/#/account/reset/")

define("template_path", default=os.path.join(base_path, "templates"))
define("static_path", default=os.path.join(base_path, "templates/static"))
define("config_path", default=os.path.join(base_path, "web_config.conf"))
define("avatar_path", default=os.path.join(upload_path, "avatar"))
define("logo_path", default=os.path.join(upload_path, "logo"))
define("common_path", default=os.path.join(upload_path, "common"))

define("mysql_user", default="fmt")
define("mysql_password", default="P@ssw0rd")
define("mysql_hostname", default="127.0.0.1")
define("mysql_port", default="3306")
define("mysql_database", default="fmt")


define("mail_api_user", default="zhangyuchen_test_q3mRsD")
define("mail_api_key", default="Yzdfh0TgglA793gq")

define("redis_host", default="redis")
define("redis_port", default=6379)
define("redis_db", default=2)
define("redis_token_ex_seconds", default=24 * 60 * 60)


define("fmt_root_email", default="admin@qq.com")
define("fmt_root_passwd", default="123456")
define("fmt_unique_email", default="unique@qq.com")
define("fmt_unique_passwd", default="123456")

try:
    parse_config_file(options.config_path)
except:
    pass

define("redis_pool", default=redis.ConnectionPool(host=options.redis_host, port=options.redis_port, db=options.redis_db))

define("db_engine", default="mysql://%s:%s@%s:%s/%s?charset=utf8" % (
    options.mysql_user, options.mysql_password, options.mysql_hostname, options.mysql_port, options.mysql_database
))
