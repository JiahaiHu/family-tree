# encoding=utf8


class MemberConfig(object):

    CUSTOMER_PERMISSION = "c"
    ADMIN_PERMISSION = "a"
    AVATAR_MIME_ALLOWED = ["image/png", "image/jpeg", "image/gif"]
    MAX_GROUP_LABEL_SUM = 5
    MAX_PROGRAM_SUM = 30
    DEFAULT_AVATAR_PATH = "/static/images/photo_L_member.png"


class GroupConfig(object):

    MAX_END_YEAR = -1

    # period start
    PERIOD_START_DAY = (10, 1)


class ProgramConfig(object):

    DEFAULT_PROGRAM_LOGO_PATH = "/static/images/photo_S_project.png"


class SiteConfig(object):

    # session
    SESS_NAME = "sessid"
    SESS_EXPIRES_DAYS = 30

    # is_basic_completed cookie
    IBC_NAME = "fmt_ibc"
    IBC_EXPIRES_DAYS = SESS_EXPIRES_DAYS

    # is_activated cookie
    IA_NAME = "fmt_ia"
    IA_EXPIRES_DAYS = SESS_EXPIRES_DAYS

    # MIME
    MIME_ALLOWED = ["image/png", "image/jpeg", "image/gif"]


class MailConfig(object):

    TEMPLATE_URL = "http://api.sendcloud.net/apiv2/mail/sendtemplate"
    FROM = "noreply@hustunique.com"
    FROM_NAME = "联创团队 Family Tree 项目"

    INVITE_TYPE_STR = "InviteType"
    ACTIVATE_TYPE_STR = "ValidateType"
    RESET_PASSWORD_STR = "ResetPasswordType"
    MAIL_MAP = {
        INVITE_TYPE_STR: {
            "template_name": "fmt_inv_code",
            "failed_list": "mail_fmt_inv_code_failed_list",
            "interval_seconds": 60
        },
        ACTIVATE_TYPE_STR: {
            "template_name": "fmt_activate",
            "failed_list": "mail_fmt_activate_failed_list",
            "interval_seconds": 60
        },
        RESET_PASSWORD_STR: {
            "template_name": "fmt_reset_password",
            "failed_list": "mail_fmt_reset_password_failed_list",
            "interval_seconds": 60
        }
    }
