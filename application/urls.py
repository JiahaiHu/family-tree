# encoding=utf8

from application import admin
from application.admin import group, user, inv_code, summary
from application.fmt import index
from application.fmt import account
from application.fmt import common
from application.fmt import render


urls = [
    (r"/", index.IndexHandler),
    (r"/account/register", account.register.RegisterHandler),
    (r"/account/login", account.login.LoginHandler),
    (r"/account/logout", account.login.LogoutHandler),
    (r"/account/email/validate", account.register.GenerateActivateURLHandler),
    (r"/account/activate/(\w+)", account.register.ActivateHandler),
    (r"/account/forgot", account.password_reset.PasswordForgotHandler),
    (r"/account/reset/(\w+)", account.password_reset.PasswordResetHandler),
    (r"/account/logout", account.login.LogoutHandler),

    (r"/account/fillin/step1", account.register_access.RegisterAccessStep1Handler),
    (r"/account/fillin/step2", account.register_access.RegisterAccessStep2Handler),

    (r"/common/search/member", common.search.SearchMemberHandler),
    (r"/common/info/group", common.info.GroupInfoHandler),

    (r"/render/timeline", render.timeline.TimeLineFetchHandler),
    (r"/render/homepage", render.homepage.HomepageRenderHandler),

    (r"/settings/m/group", account.user_group.UserGroupModifyHandler),

    (r"/settings/m/mentor", account.user_mentor.UserMentorModifyHandler),

    (r"/settings/m/program", account.user_program.ProgramModifyHandler),
    (r"/settings/m/program/create", account.user_program.ProgramCreateHandler),
    (r"/settings/m/program/delete", account.user_program.ProgramDeleteHandler),
    (r"/settings/m/program/devolve", account.user_program.ProgramModifyDevolveHandler),

    (r"/settings/m/program/member/create", account.user_program.ProgramMemberCreateHandler),
    (r"/settings/m/program/member/delete", account.user_program.ProgramMemberDeleteHandler),
    (r"/settings/m/program/member/update", account.user_program.ProgramMemberUpdateHandler),
    (r"/settings/m/program/member/exit", account.user_program.ProgramMemberExitHandler),

    (r"/settings/m/personal", account.user_personal.UserPersonalModifyHandler),
    (r"/settings/m/personal/avatar", account.user_personal.UserAvatarHandler),
    (r"/settings/m/passwd", account.user_personal.UserPasswordModifyHandler),

    (r"/admin", admin.index.IndexHandler),
    (r"/admin/manage/group", admin.index.IndexHandler),
    (r"/admin/manage/inv_code", inv_code.manage.IndexHandler),
    (r"/admin/summary", summary.manage.IndexHandler),

    (r"/admin/group/create", group.manage.GroupCreateHandler),
    (r"/admin/group/delete", group.manage.GrouopDeleteHandler),
    (r"/admin/group/merge", group.migrate.GroupMergeHandler),
    (r"/admin/group/branch", group.migrate.GroupBranchHandler),

    (r"/admin/ug", group.user_group.GroupMemberHandler),
    (r"/admin/ug/create", group.user_group.GroupMemberCreateHandler),
    (r"/admin/ug/delete", group.user_group.GroupMemberDeleteHandler),


    (r"/admin/inv_code", inv_code.manage.InvCodeQueryHandler),
    (r"/admin/inv_code/create", inv_code.manage.InvCodeCreateHandler),
    (r"/admin/inv_code/toggle", inv_code.manage.InvCodeMarkToggleHandler),
    (r"/admin/inv_code/delete", inv_code.manage.InvCodeDeleteHandler),
    (r"/admin/inv_code/send", inv_code.manage.InvCodeSendHandler),

    (r"/admin/summary/group", summary.manage.GroupSummaryHandler),
    (r"/admin/summary/component", summary.manage.ComponentSummaryHandler),

    (r"/admin/user/search", user.search.SearchUserForAdminHandler),
]
