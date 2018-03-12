# encoding=utf8

import uuid
import hashlib
import time
import os
import errno
from datetime import datetime

import bcrypt
import magic
from tornado.options import options

from application import constants
from application.common import response
def generate_password(password, rounds=10):
    return bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt(rounds))


def is_correct_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf8'), hashed.encode('utf8'))


def random_str():
    salt = str(uuid.uuid4())
    salt = salt.split('-')[0]

    m = hashlib.md5()
    m.update((salt + str(time.time())).encode('utf-8'))
    return m.hexdigest()[:8]


def generate_inv_code():
    return random_str()


def generate_activate_token(token):
    return "fmt:activate:%s" % token


def generate_activate_token_map(token):
    return "fmt:activate:m:%s" % token


def get_activate_url(token):
    return "%s%s%s" % (options.base_url, options.activate_base_url, token)


def generate_password_reset_token(token):
    return "fmt:password_reset:%s" % token


def generate_password_reset_token_map(token):
    return "fmt:password_reset:m:%s" % token


def get_password_reset_url(token):
    return "%s%s%s" % (options.base_url, options.password_reset_base_url, token)


def get_group_tuple(raw_str=""):
    r = tuple(item.strip() for item in [x for x in raw_str.split("#", 1) if x])
    group, year = r
    try:
        year = int(year)
        if year <= 2000:
            raise ValueError
        return group, year
    except ValueError:
        return


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as e:
        if e.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def save_img(path, url_base, raw_str):
    mkdir_p(path)
    try:
        img_str = raw_str.decode("base64")
    except:
        raise response.ResponseException("上传图片格式错误")

    mime_type = magic.from_buffer(img_str[:1024], mime=True)
    if mime_type not in constants.SiteConfig.MIME_ALLOWED:
        raise response.ResponseException("图片格式非法")

    file_name = hashlib.md5(str(time.time())).hexdigest() + '.' + mime_type.split('/')[1]
    save_path = os.path.join(path, file_name)
    with open(save_path, "wb") as f:
        f.write(img_str)

    return os.path.join(url_base, file_name)


def delete_img(path, img_uri):
    old_filename = img_uri.rsplit("/", 1).pop()
    old_path = os.path.join(path, old_filename)
    if os.path.isfile(old_path):
        os.remove(old_path)


def get_year_options(now=None):
    current_period = get_current_period(now)
    return current_period, current_period + 1


def get_current_period(now=None):
    if now is None:
        now = datetime.now()

    year = now.year
    if now < datetime(year, *constants.GroupConfig.PERIOD_START_DAY):
        return year - 1
    else:
        return year


def validate_year(year):
    try:
        year = int(year)
        if year < 2000:
            raise ValueError
        return year
    except:
        pass
