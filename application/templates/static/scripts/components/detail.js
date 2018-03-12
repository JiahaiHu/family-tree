var angular_module = require("./header.js").ng_module;
var $ = require("./header.js").jquery;
var clone = require("./header.js").clone;
var clone_cnm = function(target, origin) {
	// 没有深拷贝
	for(var i in origin) {
		target[i] = origin[i];
	}
};

var angular = {};angular.module = function(param) {return angular_module;}
angular.module("param")
 .directive('changeAdminPanel', function () {
    return{
      replace: true,
      template: '\
        <div ng-show="show" class="hide-delay">\
          <div class="table-center-table">\
            <div class="table-center-cell">\
              <div ng-show="show" class="table-center-obj show-transition-panel">\
                <div class="person" ng-repeat="member in members" ng-click="pop_confirm_panel($index)"> \
                  <div class="personalLogo">  \
                    <img src="``member.avatar``">\
                  </div>  \
                  <p>``member.username``</p>\
                </div>\
              </div> \
            </div> \
          </div> \
          <div confirm="" show="confirm_show" func="select"></div>\
        </div> \
      ',
      scope: {
        members: '=',
        adminid: '=',
        isadmin: '=',
        proid: '=',
        show: '='
      },
      controller: function ($scope, $timeout, settings_api, $q, $element) {
        $($element).on('click', function (e) {
          e.originalEvent.stopPropagation();
        });

        $scope.$on('clickBlur', function (e) {
          //如果现在是消失的状态，那什么都别说了
          if(!$scope.show) {
            return;
          }
          $scope.show = false;
          $scope.$apply();
        });

        var index;
        $scope.confirm_show = false;
        $scope.pop_confirm_panel = function (theIndex) {
          index = theIndex;
          $scope.confirm_show = true;
        };
        $scope.select = function () {
          var deferred = $q.defer();
          var member = $scope.members[index];

          settings_api.project.devolve({
            program_id: $scope.proid,
            user_id: member.user_id
          }).then(function (resp) {
            if(resp.data.status) {
              $scope.show = false;

              $scope.members[0].is_admin = false;
              $scope.members.splice(index, 1);
              $timeout(function () {
                $scope.members.splice(0, 0, member);
                member.is_admin = true;
              }, 500);

              $scope.isadmin = false;
              $scope.adminid = member.user_id;

              deferred.resolve();
            } else {
              deferred.reject();
              $scope.$emit('info_emit', resp.data.error);
            }
          }, function (resp) {
            deferred.reject();
            $scope.$emit('info_emit', resp.data.error);
          });
          return deferred.promise;
        };
      }
    }
  })
.directive('grantPanel', function () {
    return {
      replace: true,
      template: '\
        <div class="grant-mask" ng-class="{show:show}" ng-show="play">\
          <div class="grant-grant">\
            <div class="person" ng-repeat="member in members" ng-class="{first:$first}" \
              ng-click="exec(member.user_id, $first, $index)"> \
              <div class="personalLogo"> \
                <img ng-src="``member.avatar || \'/static/images/default_avatar.png\'``">\
              </div> \
              <p class="username">``member.username``</p>\
            </div>\
          </div> \
        </div>\
      ',
      scope: {
        toggle: '='
      },
      controller: [
				"$scope", "$element", "$q", "settings_api", "$timeout", 
			function ($scope, $element, $q, settings_api, $timeout) {
        var project_id;
        $scope.toggle = function (data) {
          $scope.play = true;
          $scope.members = data.member;
          $scope.show = true;
          project_id = data.project;
        };

        $element.on('click', function() {
          $scope.show = false;
          $timeout(function () {
            $scope.play = false;
          }, 300);
          $scope.$apply();
        });
        $('.grant-grant', $element).on('click', function (e) {
          e.stopPropagation();
          $scope.$apply();
        });

        $scope.exec = function (user_id, first, index) {
          if(first) return;
          $scope.$emit('modalShow', {
            title: "确认",
            info: "确认转移管理权吗？",
            btns: [
              {
                "text": "取消"
              },
              {
                "text": "确定",
                func: function () {
                  var deferred = $q.defer();
                  settings_api.project.devolve({
                    program_id: project_id,
                    user_id: user_id
                  }).then(function (resp) {
                    if(resp.data.status) {
                      var person = $scope.members.splice(index, 1);
                      $scope.members.unshift(person[0]);
                      $scope.$emit('grant', project_id);
                      $timeout(function () {
                        $scope.show = false;
                        $timeout(function () {
                          $scope.play = false;
                        }, 300);
                      }, 300);
                      deferred.resolve();
                    } else {
                      $scope.$emit('modalShow', {
                        title: "错误",
                        info: resp.data.error,
                        btns: [{
                          text: "确定"
                        }]
                      });
                      deferred.reject();
                    }
                  }, function () {
                    $scope.$emit('modalShow', {
                      title: "错误",
                      info: "服务器错误，请与管理员联系",
                      btns: [{
                        text: "确定"
                      }]
                    });
                    deferred.reject();
                  });
                  return deferred.promise;
                }
              }
            ]
          })
        };
      }]
    }
  })
.directive('project', function () {
    return {
      template: '\
        <div save-loader="" request="submit" status="status"></div>\
        <div class="head">\
          <div class="pro-avatar" project-logo base64="project.base64" logo="project.logo"></div>\
          <div class="pro-name">\
            <label for="projectName">项目名称</label>\
            <input id="projectName" ng-model="project.title" ng-disabled="!project.is_admin">\
          </div>\
          <div class="year-selector">\
            <select ng-model="project.year" ng-options="year as year for year in yearList" ng-disabled="!project.is_admin">\
            </select>\
          </div>\
        </div>\
        <div>\
          <label>项目简介</label>\
          <textarea class="project-intro" spellcheck="false" ng-model="project.description" ng-disabled="!project.is_admin">\
          </textarea>\
        </div>\
        <!--``project``-->\
        <div>\
          <label>项目图片</label>\
          <div file-loader base64="project.imagebase64" disable="!project.is_admin" base64comp="project.image"></div>\
        </div>\
        <div>\
          <label>项目成员</label>\
          <project-member-list data="data" edit="true"\
            members="project.member"\
            exist="data.project.projectMember[index]"\
            isadmin="project.is_admin"\
            func="func" number="7">\
           </project-member-list>\
        </div>\
        <div>\
          <label>其他操作</label>\
          <div>\
            <button ng-show="project.is_admin" ng-click="pop_del_confirm()">删除项目</button>\
            <div confirm="" show="del_confirm_show" func="del_project"></div>\
          </div>\
          <div>\
            <button ng-show="project.is_admin" ng-click="change_admin()" class="change-btn">转移管理权限</button>\
            <div change-admin-panel members="project.member" proid="project.program_id"\
              isadmin="project.is_admin" adminid="project.admin_id" show="change_panel_show"></div>\
          </div>\
          <div>\
            <button ng-show="!project.is_admin" ng-click="pop_exit_confirm()">退出项目</button>\
            <div confirm="" show="exit_confirm_show" func="exit_project"></div>\
          </div>\
        </div>\
      ',
      //没法直接指定，因为有多个地方使用这个控件，而数据各不相同
      scope: {
        index: '@',
        data: '=',
        func: '=',
        project: '='
      },
      controller: function ($scope, settings_api, $q, $element) {
       // $scope.change_panel_show = false;
        if(!$scope.project.program_id) {
          $scope.project.is_admin = true;
        }

        $('.change-btn', $element).on('click', function (e) {
          e.originalEvent.stopPropagation();
        });
        $scope.change_admin = function () {
          if($scope.status !== 'clean') {
            $scope.$emit('info_emit', "请先保存项目，再移交管理权限。");
          } else {
            $scope.change_panel_show = true;
          }
        };

        //此处的status只有clean与dirty两个值
        $scope.status = "clean";
        //不需要使用get_info,因为它是在get_info发生之后才生成的
        $scope.$watch("project", function (newValue, oldValue) {
          if(oldValue !== newValue) {
            $scope.status = 'dirty';
          }
        }, true);

        /**
         * 设置年份
         */
        //获取当前年份
        $scope.getCurrentYear = function () {
          return new Date().getFullYear()
        };
        var currentYear = $scope.getCurrentYear();
        var yearList = [];
        for(var startYear = 2000; startYear <= currentYear; startYear ++) {
          yearList.push(startYear);
        }
        $scope.yearList = yearList;

        var clone = function(obj){
          var o;
          if (obj.constructor == Object){
            o = new obj.constructor();
          }else{
            o = new obj.constructor(obj.valueOf());
          }
          for(var key in obj){
            if ( o[key] != obj[key] ){
              if ( typeof(obj[key]) == 'object' ){
                o[key] = clone(obj[key]);
              }else{
                o[key] = obj[key];
              }
            }
          }
          o.toString = obj.toString;
          o.valueOf = obj.valueOf;
          return o;
        };

        var projectData = $scope.project;
        $scope.submit = function () {
          var deferred = $q.defer();
          var clonedObj = clone(projectData);
          clonedObj.logo = clonedObj.base64;
          if(clonedObj.logo == null) {
            delete clonedObj.logo;
          }
          if(clonedObj.imagebase64 == null) {
            delete clonedObj.image;
          }
          var member = [];
            for(var i in clonedObj.member) {
              //why
              if(!clonedObj.member[i].user_id) {
                break;
              }
              member.push(clonedObj.member[i].user_id);
            }
          //判断是否管理
          if($scope.project.is_admin) {
            if(clonedObj.program_id) {
              //如果有id，说明是修改，否则是新建
              settings_api.project.update({info:JSON.stringify(clonedObj)}).then(function (resp) {
                if(resp.data.status) {
                  settings_api.project.updateMember({info: JSON.stringify({
                    program_id: clonedObj.program_id,
                    member: member
                  })}).then(function (resp) {
                    if(resp.data.status) {
                      //$scope.$emit('info_emit', );
                      deferred.resolve("修改成功");
                      $scope.data.project.projectMember[$scope.index] = $scope.project.member;
                    } else {
                      $scope.$emit('info_emit', resp.data.error);
                      deferred.reject(resp.data.error);
                    }
                  })
                } else {
                  $scope.$emit('info_emit', resp.data.error);
                  deferred.reject(resp.data.error);
                }
              })
            } else {
              //新建项目
              clonedObj.member = member;
              settings_api.project.create({info:JSON.stringify(clonedObj)}).then(function (resp) {
                if(resp.data.status) {
                  //$scope.$emit('info_emit', "保存成功");
                  deferred.resolve("保存成功");
                  $scope.data.project.projectMember[$scope.index] = $scope.project.member;
                } else {
                  $scope.$emit('info_emit', resp.data.error);
                  deferred.reject(resp.data.error);
                }
              })
            }
          } else {
            settings_api.project.updateMember(
              {
                info: JSON.stringify({
                  program_id: $scope.project.program_id,
                  member: member
                })
              }
            ).then(function (resp) {
              if(resp.data.status) {
                //$scope.$emit('info_emit', );
                deferred.resolve("修改成功");
                $scope.data.project.projectMember[$scope.index] = $scope.project.member;
              } else {
                $scope.$emit('info_emit', resp.data.error);
                deferred.reject(resp.data.error);
              }

            }, function (resp) {

            })
          }
          return deferred.promise;
        };


        $scope.del_confirm_show = false;
        $scope.del_project = function () {
          var deferred = $q.defer();

          settings_api.project.del({
            program_id: $scope.project.program_id
          }).then(function (resp) {
            if(resp.data.status) {
              //$scope.project = undefined;
              $scope.data.project.projects.splice($scope.index, 1);
              $scope.data.project.projectMember.splice($scope.index, 1);
              deferred.resolve();
            } else {
              deferred.reject();
              $scope.$emit('info_emit', resp.data.error);
            }
          }, function (resp) {
            deferred.reject();
            $scope.$emit('info_emit', resp.data.error);
          });
          return deferred.promise;
        };
        $scope.pop_del_confirm = function () {
          $scope.del_confirm_show = true;
        };

        //类似于上面
        $scope.exit_confirm_show = false;
        $scope.exit_project = function () {
          var deferred = $q.defer();

          settings_api.project.exit({
            program_id: $scope.project.program_id
          }).then(function (resp) {
            if(resp.data.status) {
              //$scope.project = undefined;
              $scope.data.project.projects.splice($scope.index, 1);
              $scope.data.project.projectMember.splice($scope.index, 1);
              deferred.resolve();
            } else {
              deferred.reject();
              $scope.$emit('info_emit', resp.data.error);
            }
          }, function (resp) {
            deferred.reject();
            $scope.$emit('info_emit', resp.data.error);
          });
          return deferred.promise;
        };
        $scope.pop_exit_confirm = function () {
          $scope.exit_confirm_show = true;
        };
      }
    }
  })
  .directive('project2', function () {
    return {
      template: '\
        <div class="head">\
          <div class="pro-avatar" project-logo base64="project2.base64" logo="project2.logo"\
            disabled="!project2.is_admin"></div>\
          <div class="pro-name">\
            <label for="projectName">项目名称</label>\
            <input id="projectName" ng-model="project2.title" ng-disabled="!project2.is_admin">\
          </div>\
          <div class="year-selector">\
            <select ng-model="project2.year" ng-options="year as year for year in yearList" \
              ng-disabled="!project2.is_admin">\
            </select>\
          </div>\
        </div>\
        <div>\
          <label>项目简介</label>\
          <textarea class="project-intro" spellcheck="false" \
							ng-model="project2.description" ng-disabled="!project2.is_admin">\
          </textarea>\
        </div>\
        <div>\
          <label>项目图片</label>\
					<div ng-show="project2.image">\
						<img ng-src="``project2.image``" alt="项目图片">\
					</div>\
					<br>\
          <div file-loader base64="project2.imagebase64" disabled="!project2.is_admin" base64comp="project2.image"></div>\
        </div>\
        <div>\
          <label>项目成员</label>\
          <project-member-list data="data" edit="true"\
            members="project2.member"\
            exist="exist"\
            isadmin="project2.is_admin"\
            func="func" number="5">\
           </project-member-list>\
        </div>\
        \
        <!--\
        <div>\
          <div>\
            <button ng-show="project2.is_admin" ng-click="change_admin()" class="change-btn">转移管理权限</button>\
            <div change-admin-panel members="project.member" proid="project.program_id"\
              isadmin="project.is_admin" adminid="project.admin_id" show="change_panel_show"></div>\
          </div>\
        </div>\
        -->\
        <div class="margin-btn" ng-if="!notsave">\
          <button class="btn-yellow btn-half" ng-click="submit()">保存编辑</button>\
          <button class="btn-yellow btn-half" ng-click="closeeditor()">放弃编辑</button>\
        </div>\
      ',
      //没法直接指定，因为有多个地方使用这个控件，而数据各不相同
      scope: {
        index: '@',
        //data: '=',
        func: '=',
        project2: '=',
        closeeditor: '=',
        newproject: '=',
        exist: '=',
        notsave: '@'
      },
      controller: function ($scope, settings_api, $q, $element) {
       // $scope.change_panel_show = false;
				/*
				 * 当此项目没有id时
				 * 认为自己就是管理员
				 */
        if(!$scope.project2.program_id) {
          $scope.project2.is_admin = true;
        }

        $('.change-btn', $element).on('click', function (e) {
          e.originalEvent.stopPropagation();
        });
        $scope.change_admin = function () {
          if($scope.status !== 'clean') {
            $scope.$emit('info_emit', "请先保存项目，再移交管理权限。");
          } else {
            $scope.change_panel_show = true;
          }
        };

        //此处的status只有clean与dirty两个值
        $scope.status = "clean";
        //不需要使用get_info,因为它是在get_info发生之后才生成的
        $scope.$watch("project", function (newValue, oldValue) {
          if(oldValue !== newValue) {
            $scope.status = 'dirty';
          }
        }, true);

        /**
         * 设置年份
         */
        //获取当前年份
        $scope.getCurrentYear = function () {
          return new Date().getFullYear()
        };
        var currentYear = $scope.getCurrentYear();
        var yearList = [];
        for(var startYear = 2000; startYear <= currentYear; startYear ++) {
          yearList.push(startYear);
        }
        $scope.yearList = yearList;

        var clone = function(obj){
          var o;
          if (obj.constructor == Object){
            o = new obj.constructor();
          }else{
            o = new obj.constructor(obj.valueOf());
          }
          for(var key in obj){
            if ( o[key] != obj[key] ){
              if ( typeof(obj[key]) == 'object' ){
                o[key] = clone(obj[key]);
              }else{
                o[key] = obj[key];
              }
            }
          }
          o.toString = obj.toString;
          o.valueOf = obj.valueOf;
          return o;
        };

				/*
				 * projectData
				 * 保存了对本项目的引用
				 */
        var projectData = $scope.project2;

				/*
				 * 项目提交
				 */
        $scope.submit = function () {
          var deferred = $q.defer();
          var clonedObj = clone(projectData);
          clonedObj.logo = clonedObj.base64;
          if(clonedObj.logo == null) {
            delete clonedObj.logo;
          }
          if(clonedObj.imagebase64) {
            clonedObj.image = clonedObj.imagebase64;
          } else {
            delete clonedObj.image;
          }
          var member = [];
          for(var i in clonedObj.member) {
            //why
            if(!clonedObj.member[i].user_id) {
              break;
            }
            member.push(clonedObj.member[i].user_id);
          }
          //判断是否管理
          if(projectData.is_admin) {
            if(clonedObj.program_id) {
              //如果有id，说明是修改，否则是新建
              settings_api.project.update({info:JSON.stringify(clonedObj)}).then(function (resp) {
                if(resp.data.status) {
                  settings_api.project.updateMember({info: JSON.stringify({
                    program_id: clonedObj.program_id,
                    member: member
                  })}).then(function (resp) {
                    if(resp.data.status) {
                      //$scope.$emit('info_emit', );
                      deferred.resolve("修改成功");
                      $scope.$emit('updated');
                      //$scope.data.project.projectMember[$scope.index] = $scope.project.member;
                      $scope.closeeditor();
                    } else {
                      //$scope.$emit('info_emit', resp.data.error);
                      $scope.$emit('modalShow', {
                        title: "错误",
                        info: resp.data.error,
                        btns: [
                          {
                            text: "确认"
                          }
                        ]
                      });
                      deferred.reject(resp.data.error);
                    }
                  }, function () {
                    $scope.$emit('modalShow', {
                      title: "错误",
                      info: "服务器错误，请告知管理员",
                      btns: [
                        {
                          text: "确认"
                        }
                      ]
                    });
                  });
                } else {
                  //$scope.$emit('info_emit', resp.data.error);
                  $scope.$emit('modalShow', {
                    title: "错误",
                    info: resp.data.error,
                    btns: [
                      {
                        text: "确认"
                      }
                    ]
                  });
                  deferred.reject(resp.data.error);
                }
              }, function () {
                $scope.$emit('modalShow', {
                  title: "错误",
                  info: "服务器错误，请告知管理员",
                  btns: [
                    {
                      text: "确认"
                    }
                  ]
                });
              })
            } else {
              //新建项目
              clonedObj.member = member;
              settings_api.project.create({info:JSON.stringify(clonedObj)}).then(function (resp) {
                if(resp.data.status) {
                  $scope.$emit('setId', resp.data.message.program_id);
                  projectData.program_id = resp.data.message.program_id;
									projectData.newproject = null;
                  $scope.$emit('updated');
									console.log("创建");
                  $scope.closeeditor();
                  $scope.$emit('createProjectFinished', 'msg');
                  deferred.resolve("保存成功");
                  //$scope.data.project.projectMember[$scope.index] = $scope.project.member;
                } else {
                  //$scope.$emit('info_emit', resp.data.error);
                  $scope.$emit('modalShow', {
                    title: "错误",
                    info: resp.data.error,
                    btns: [
                      {
                        text: "确认"
                      }
                    ]
                  });
                  deferred.reject(resp.data.error);
                }
              }, function () {
                $scope.$emit('modalShow', {
                  title: "错误",
                  info: "服务器错误，请告知管理员",
                  btns: [
                    {
                      text: "确认"
                    }
                  ]
                });
              })
            }
          } else {
            settings_api.project.updateMember(
              {
                info: JSON.stringify({
                  program_id: $scope.project2.program_id,
                  member: member
                })
              }
            ).then(function (resp) {
              if(resp.data.status) {
                //$scope.$emit('info_emit', );
                $scope.$emit('updated');
                $scope.closeeditor();
                deferred.resolve("修改成功");
                //$scope.data.project.projectMember[$scope.index] = $scope.project.member;
              } else {
                //$scope.$emit('info_emit', resp.data.error);
                $scope.$emit('modalShow', {
                  title: "错误",
                  info: resp.data.error,
                  btns: [
                    {
                      text: "确认"
                    }
                  ]
                });
                deferred.reject(resp.data.error);
              }
            }, function (resp) {
              $scope.$emit('modalShow', {
                title: "错误",
                info: "服务器错误，请告知管理员",
                btns: [
                  {
                    text: "确认"
                  }
                ]
              });
            })
          }
          return deferred.promise;
        };

        $scope.del_confirm_show = false;
        $scope.del_project = function () {
          var deferred = $q.defer();

          settings_api.project.del({
            program_id: $scope.project.program_id
          }).then(function (resp) {
            if(resp.data.status) {
              //$scope.project = undefined;
              $scope.data.project.projects.splice($scope.index, 1);
              $scope.data.project.projectMember.splice($scope.index, 1);
              deferred.resolve();
            } else {
              deferred.reject();
              $scope.$emit('info_emit', resp.data.error);
            }
          }, function (resp) {
            deferred.reject();
            $scope.$emit('info_emit', resp.data.error);
          });
          return deferred.promise;
        };
        $scope.pop_del_confirm = function () {
          $scope.del_confirm_show = true;
        };

        //类似于上面
        $scope.exit_confirm_show = false;
        $scope.exit_project = function () {
          var deferred = $q.defer();

          settings_api.project.exit({
            program_id: $scope.project.program_id
          }).then(function (resp) {
            if(resp.data.status) {
              //$scope.project = undefined;
              $scope.data.project.projects.splice($scope.index, 1);
              $scope.data.project.projectMember.splice($scope.index, 1);
              deferred.resolve();
            } else {
              deferred.reject();
              $scope.$emit('info_emit', resp.data.error);
            }
          }, function (resp) {
            deferred.reject();
            $scope.$emit('info_emit', resp.data.error);
          });
          return deferred.promise;
        };
        $scope.pop_exit_confirm = function () {
          $scope.exit_confirm_show = true;
        };
      }
    }
  })
	.directive('detailProject', function () {
		return {
			template: '\
			<article class="columnBlock" ng-class="{new_project:theproject.newproject}">\
				<div class="header project-info">\
					<img class="logo" ng-src="``theproject.logo``" alt="project-logo">\
					<div>\
						<h2 class="project-title">``theproject.title``</h2>\
						<span class="project-year">``theproject.year``</span>\
					</div>\
					<div project-operator="" ng-if="self" data="theproject"></div>\
				</div>\
				<p class="project-desc project-info">``theproject.description``</p>\
				<img ng-src="``theproject.image``" class="project-img project-info" ng-if="theproject.image">\
				<div member-list="" members="theproject.member" number="7" class="members project-info"></div> \
				<!--<div class="members project-info">\
					<ul>\
						<li ng-repeat="member in project.member" class="member">\
							<img ng-src="``member.avatar || \'/static/images/default_avatar.png\'``" class="avatar">\
							<p class="member-name">``member.username``</p>\
						</li>\
					</ul>\
				</div>-->\
				<a class="margin-btn btn-yellow" ng-click="showEditor()" ng-if="self">编辑项目</a>\
			</article>\
			<div project2="project2" class="columnBlock" ng-if="edit" closeeditor="closeeditor"\
				newproject="theproject.newproject" exist="theproject.member"></div>\
			',
			scope: {
				theproject: '=',
				self: '=',
				arr: '='
			},
			controller: function ($scope, $element, $timeout) {
				$scope.$on('grant2', function (e, project_id) {
					if($scope.theproject.program_id === project_id) {
						$scope.theproject.is_admin = false;
					}
				});

				var ele = $($element.find('article')[0]);
				$scope.project2 = {};

				if($scope.theproject.newproject) {
					$scope.project2 = clone($scope.theproject);
					$scope.edit = true;
				}

				$scope.showEditor = function () {
					$scope.project2 = clone($scope.theproject);

					$scope.edit = true;

					ele.height(ele.height());
					ele.removeClass('myFadeInLeft');
					ele.addClass('animated myFadeOutRight');
				};

				var computeHeight = (function () {
					var headHeight = 64;
					var memberHeight = 113;
					//图片高度默认位0，如果有图，之后修改
					var imgHeight = 0;
					var btnHeight = 26;

					//项目内容宽度，即图片最大宽度
					var imgMaxWidth = 642;
					return function () {
						var descHeight = $(ele[0].querySelector('.project-desc')).height()+16;

						//重点，图片
						if($scope.theproject.image) {
							var img = $(ele[0].querySelector('.project-img'));
							var img_width = img.width();
							if(img_width <= imgMaxWidth) {
								//没有被缩放
								imgHeight = img.height()+16;
							} else {
								imgHeight = img.height()+16;
							}
						}

						var height = headHeight + memberHeight + imgHeight + descHeight + btnHeight;
						//console.log(headHeight, memberHeight, imgHeight, descHeight, btnHeight)
						ele.css('height', height);
					}
				})();

				$scope.$on('updated', function () {
					clone_cnm($scope.theproject, $scope.project2);
				});

				$scope.closeeditor = function () {
					if($scope.theproject.newproject) {
						$scope.$emit('modalShow', {
							title: "确认",
							info: "确定取消此新建项目吗",
							btns: [
								{
									text: "取消"
								},
								{
									text: "确定",
									func: function () {
										$scope.arr.pop();
                  	$scope.$emit('createProjectFinished', 'msg');
									}
								}
							]
						});
					} else {
						$timeout(function () {
							var close = function () {
								$scope.edit = false;
								$scope.theproject.newproject = false;
								$scope.$apply();
								ele.off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', close);
							};
							computeHeight();
							ele.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', close);
							ele.removeClass('myFadeOutRight');
							ele.addClass('animated myFadeInLeft');
						}, 1);
					}
				};
			}
		}
  })
  .directive('groupInput', function () {
    return {
      template: '\
      <div class="groupContainer">\
        <div group-list groups="personal.groups" number="``number``" disabled="disabled"></div>\
        <span class="addGroup" ng-click="click($event)" ng-if="!disabled">\
					<img src="/static/images/ic_add_group.png">\
				</span>\
        <div tabindex="-1" id="groupPanel" group-select-panel="" groups="personal.groups" ng-show="show"></div>\
      </div>\
      ',
      scope: {
        number: '@',
        disabled: '=',
        personal: '=',
        show: '=',
        click: '='
      },
      controller: function () {
      }
    }
  })
  .directive('projectOperator', function () {
    return {
      replace: true,
      template: '\
        <button data-capacity="``opList.length``">\
          <img src="/static/images/ic_manage.png" class="fill-content">\
          <ul class="fill-content op-lists">\
            <li class="op-list" ng-repeat="list in opList" ng-click="list.func()">\
              <span class="iconfont" ng-bind-html="list.icon | trustHtml"></span>\
              ``list.text``\
            </li>\
          </ul>\
        </button>\
      ',
      scope: {
        data: '='
      },
      controller: function ($scope, settings_api, $q, $timeout) {
        var obj = {};
        obj.exit_normal = function () {
          $scope.$emit('modalShow', {
            title: "确认",
            info: "退出项目后，此项目将从项目经历中删除，确定退出？",
            btns: [
              {
                text: "取消"
              },
              {
                text: "确定",
                func: function () {
                  var deferred = $q.defer();
                  settings_api.project.exit({program_id: $scope.data.program_id}).then(function (resp) {
                    if(resp.data.status) {
                      //退出成功
                      $scope.$emit('projectDel', $scope.data.program_id);
                      deferred.resolve();
                    } else {
                      //退出失败
                      $scope.$emit('modalShow', {
                        title: "操作失败",
                        info: resp.data.error,
                        btns: [
                          {
                            text: "确定"
                          }
                        ]
                      });
                      deferred.reject();
                    }
                  }, function () {
                    //服务器错误
                    $scope.$emit('modalShow', {
                      title: "错误",
                      info: "服务器错误，请联系管理员",
                      btns: [
                        {
                          text: "确定"
                        }
                      ]
                    });
                    deferred.reject();
                  });
                  return deferred.promise;
                }
              }
            ]
          });
        };
        obj.exit_admin = function () {
          $scope.$emit('modalShow', {
            title: "提示",
            info: "您是管理员，退出将导致整个项目删除，请先移交权限，或直接删除整个项目",
            btns: [
              {
                text: "取消"
              },
              {
                text: "移交权限",
                func: function () {
									//var deferred = $q.defer();
									obj.grant();
									//deferred.reject();
									//return deferred.promise;
								}
							},
              {
                text: "删除项目",
                func: function () {
                  var deferred = $q.defer();
                  obj.del();
                  deferred.reject();
                  return deferred.promise;
                }
              }
            ]
          });
        };
        obj.del = function () {
          $scope.$emit('modalShow', {
            title: "警告",
            info: "删除项目将导致此项目从所有成员的项目经历中删除，确定删除？",
            btns: [
              {
                text: "取消"
              },
              {
                text: "确定",
                func: function () {
                  var deferred = $q.defer();
                  settings_api.project.del({program_id: $scope.data.program_id}).then(function (resp) {
                    if(resp.data.status) {
                      //成功删除
                      $scope.$emit('projectDel', $scope.data.program_id);
                      deferred.resolve();
                    } else {
                      //删除失败
                      $scope.$emit('modalShow', {
                        title: "操作失败",
                        info: resp.data.error,
                        btns: [
                          {
                            text: "确定"
                          }
                        ]
                      });
                      deferred.reject();
                    }
                  }, function () {
                    //服务器错误
                    $scope.$emit('modalShow', {
                      title: "错误",
                      info: "服务器错误，请联系管理员",
                      btns: [
                        {
                          text: "确定"
                        }
                      ]
                    });
                    deferred.reject();
                  });
                  return deferred.promise;
                }
              }
            ]
          });
        };
        obj.grant = function () {
          $scope.$emit('grantShow', {
            member: $scope.data.member,
            project: $scope.data.program_id
          });
        };

        $scope.$watch('data.is_admin', function (newValue) {
          if(newValue) {
            $scope.opList = [
              {
                icon: "&#xe60d;",
                text: "移交权限",
                func: function () {
                  obj.grant();
                }
              },
              {
                icon: "&#xe60b;",
                text: "删除项目",
                func: function () {
                  obj.del();
                }
              },
              {
                icon: "&#xe60c;",
                text: "退出项目",
                func: function () {
                  obj.exit_admin();
                }
              }
            ];
          } else {
            $scope.opList = [
              {
                icon: "&#xe60c;",
                text: "退出项目",
                func: function () {
                  obj.exit_normal();
                }
              }
            ];
          }
        });
      }
    }
  })
  .directive('centerGallery', ['$window', '$timeout', function($window, $timeout) {
    return {
      replace: true,
      template:
          '<div class="moveObj">\
            <div>\
            <img src="../../static/images/surf/bottom2.png">  \
            <img class="plane" id="plane1" src="../../static/images/surf/middle.png">\
            <img src="../../static/images/surf/top2.png">   \
            </div>\
          </div>',
      controller: function($scope, $element) {
        var fullScreen;
        $scope.$watch('offsetLeft', function() {
          $element.css('left', $scope.offsetLeft+"px");
        });

        $scope.height = $element[0].offsetHeight - 120;
        var isMoving = false;
        $scope.$watch('offsetTop', function() {
          if(isMoving) return;
          isMoving = true;
          $timeout(function () {
            var percent = $scope.offsetTop / (fullScreen[0].scrollHeight - fullScreen[0].clientHeight);
            var pos = $scope.height * percent + 60;
            $('#plane1').css('bottom', pos + 'px');
            isMoving = false;
          }, 300);
        });
        var work = function () {
          //使用$().offset().left会造成不同的结果，待研究
          var tmp = $('.container')[0].offsetLeft;
          $scope.offsetLeft = tmp  + 338 - fullScreen[0].scrollLeft;
          $scope.offsetTop = fullScreen[0].scrollTop;
          $scope.$apply();
        };

        $($window).resize(function () {
          work();
          $scope.height = $element[0].offsetHeight - 120;
        });
				// 离开作用域则取消绑定
				$scope.$on("$destroy", function() {
					$($window).off("resize");
					fullScreen.off("scroll");
				});

				$timeout(function () {
					fullScreen = $('.fullScreenContainer')
					fullScreen.scroll(work);
					work();
        }, 0);
      }
    }
  }])
  .directive('projectsPanel', function () {
    return {
      replace: true,
      template: '\
        <button ng-show="show" id="ssss">\
          <img class="sitting-kid" src="../../static/images/sitting_kid.png">\
          <div class="board"></div>\
          <div class="panel-body">\
            <h4>和``friend.username``合作的项目</h4>\
            <ul class="lists">\
              <li class="list" ng-repeat="project in friend.projects">\
                <div class="project-year">\
                  ``project.year``\
                </div>\
                <img ng-src="``project.logo``">\
                <div class="detail">\
                  <div class="project-name">``project.title``</div>\
                  <div class="project-partner">\
                    <span ng-repeat="member in project.member">``member.username`` </span>\
                  </div>\
                </div>\
              </li>\
            </ul>\
          </div>\
        </button>\
      ',
      scope: {
        friend: '=',
        focusflag: '='
      },
      controller: function ($scope, $element, $timeout) {
        $scope.$watch("focusflag", function (newValue, oldValue) {
          if(newValue) {
            $timeout(function () {
              $element[0].focus();
            }, 1);

            $scope.show = true;
          } else {
            $scope.focusflag = false;
            $scope.show = false;
          }
        });
        $element.on('blur', function () {
          $scope.focusflag = false;
          $scope.show = false;
          $scope.$apply();
        });
      }
    }
  })
  .directive("saveLoader", function () {
    return {
      replace: true,
      template: '\
        <div ng-click="save()" ng-show="status!==\'clean\'">\
          <div class="animate-circle" ng-show="status===\'wait\'"></div>\
          <div class="animate-tick"></div> \
          <div class="tick-mask" \
            ng-class="{view:status===\'success\'}"></div> \
        </div>\
        \
      ',
      scope: {
        request: '=',
        status: '='
      },
      controller: function ($scope, $q, $timeout) {
        // clean, dirty, wait
        // wait: circle show, tick show, mask hidden
        // clean: total hidden
        // dirty: circle hidden, tick show, mask hidden
        // success: circle hidden, tick show, mask show
        //$scope.status = "dirty";

        $scope.save = function () {
          $scope.status = "wait";
          $scope.request().then(function () {
            //如果成功了
            $scope.status = "success";
            $timeout(function () {
              $scope.status = 'clean';
            }, 1000);
          }, function () {
            $scope.status = "dirty";
          })
        };
      }
    }
  })
  .directive('fileLoader', ['img2base64', function (img2base64) {
    return {
      template: '\
        <input type="file" ng-disabled="disabled">\
        <button class="shadowBtn" ng-disabled="disabled">``fileName?fileName:"选择图片"``</button>\
      ',
      controller: function ($scope, $element) {
        $scope.fileName='';
        var inputEle = $($element.find("input")[0]);
        inputEle.on('change', function () {
          $scope.file = this.files[0];
          $scope.fileName = $scope.file.name;
          img2base64($scope.file, function (result) {
            $scope.base64 = result.split(',')[1];
            console.log(result)
            $scope.base64comp = result;
            $scope.$apply();
          });
          $scope.$apply();
        })
      },
      scope: {
        base64: '=',
        base64comp: '=',
        disabled: "="
      }
    }
  }])
