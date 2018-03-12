var angular_module = require("./header.js").ng_module;
var $ = require("./header.js").jquery;

var angular = {};angular.module = function(param) {return angular_module;}
angular.module("param")
  .directive('basicSetPanel', function () {
    return {
      template: '\
        <label for="wechat">微信</label> \
        <input id="wechat" class="input" ng-model="personal.wechat_id" ng-disabled="disabled">\
        <label for="blog">博客</label>\
        <input id="blog" class="input" ng-model="personal.blog" ng-disabled="disabled">\
        <label>组别</label>\
        <div group-input="" class="input" number="3" personal="personal" show="selectorShow"\
          click="popGroupSelector" disabled="disabled"></div> \
        <label for="status">现在状态</label>\
        <select id="status" class="input" ng-disabled="disabled" ng-model="personal.is_graduated"\
          ng-options="o.v as o.n for o in [{ n: \'在团队（大三及以下）\', v: false }, { n: \'已毕业\', v: true }]">\
        </select>\
        <label for="location">现所在地</label>\
        <input id="location" class="input" ng-model="personal.location" ng-disabled="disabled">\
      ',
      scope: {
        personal: '=',
        disabled: '='
      },
      controller: [
				"$scope", "settings_api", "$element", "$timeout", "$q",
			function ($scope, settings_api, $element, $timeout, $q) {
        $scope.$on('get_info', function () {
          $scope.$watch("personal", function (newValue, oldValue) {
            if(newValue !== oldValue) {
              $scope.modified = true;
              $scope.status = 'dirty';
            }
          }, true);
        });
        $scope.status = 'clean';

        $('#groupPanel').on('click', function (e) {
          e.originalEvent.stopPropagation();
        });

        $scope.$on('clickBlur', function (e) {
          //如果现在是消失的状态，那什么都别说了
          if(!$scope.selectorShow) {
            return;
          }
          $scope.selectorShow = false;
          $scope.$apply()
        });

        $scope.selectorShow = false;

        $scope.popGroupSelector = function (e) {
          e.stopImmediatePropagation();
          $scope.selectorShow = true;
        };
      }]
    }
  })
  .directive('relationSetPanel', function () {
    return {
      template: '\
        <div>\
          <label>\
            Mentor\
          </label>\
          <div project-member-list data="data" func="func" members="relation.mentors"\
            disabled="disabled"\
           edit="true" number="2"></div>\
        </div>\
        <div>\
          <label>\
            Mentee\
          </label>\
          <div class="peopleContainer">\
            <div member-list="" members="relation.mentees" number="3"></div> \
          </div>\
        </div>\
        \
      ',
      scope: {
        disabled: '=',
        relation: '='
      },
      controller: [
				"$scope", "settings_api", "$q",
			function ($scope, settings_api, $q) {
        $scope.$on('get_info', function (e) {
          $scope.$watch('data.relation.mentors', function (newValue, oldValue) {
            if(newValue !== oldValue) {
              $scope.status = 'dirty';
            }
          }, true);
        });

        $scope.status = 'clean';

        $scope.save = function () {

        }
      }]
    }
  })
  .directive('groupSelectPanel', function () {
    return {
      template: '\
      <div>\
        <select ng-model="groupSelected" ng-change="change(groupSelected)">\
          <option ng-repeat="group in groupList">``group``</option>\
        </select>\
        <select ng-model="yearSelected">\
          <option ng-repeat="year in yearList">``year``</option>\
        </select>\
        <button ng-click="submit()" ng-disabled="!yearSelected || !groupSelected">确定</button>\
      </div>\
      ',
      scope: {
        groups: '='
      },
      controller: [
				"$scope", "$element", "common",
			function ($scope, $element, common) {
        $scope.change = function (group_name) {
          $scope.yearList = group_year[group_name];
          //$scope.yearSelected = $scope.yearList[0];
        };

        $scope.groupList = [];
        var group_year = {};

        common.group().then(function (resp) {
          var groups = resp.data.message.groups;
          if(resp.data.status) {
            for(var i in groups) {
              $scope.groupList.push(groups[i].group_name);

              var year = [];
              for(var j = groups[i].start_year; j <= groups[i].end_year; j++) {
                year.push(j);
              }
              group_year[groups[i].group_name] = year;
            }
            $scope.groupSelected = $scope.groupList[0];
            $scope.yearList = group_year[$scope.groupSelected];
            //$scope.yearSelected = $scope.yearList[0];
          } else {

          }
        }, function (resp) {
        });

        $scope.submit = function () {
          if($scope.groups.length >= 4) {
            $scope.$emit('modalShow', {
              title: "错误",
              info: "你最多可以添加4个组",
              btns: [
                {
                  text: "确认",
                  func: function(){}
                }
              ]
            });
            return;
          }

          var newGroup = $scope.groupSelected+"#"+$scope.yearSelected;
          //实现互异
          for(var i in $scope.groups) {
            if($scope.groups[i] === newGroup) {
              $scope.$emit('modalShow', {
                title: "错误",
                info: "你已添加过该组",
                btns: [
                  {
                    text: "确认",
                    func: function(){}
                  }
                ]
              });
              return;
            }
          }
          $scope.groups.push(newGroup);
        };
      }]
    }
  })
  .directive("updatePwdPanel", function () {
    return {
      replace: true,
      template: '\
      <div class="hide-delay" ng-show="show">\
        <div mask class="show-transition-mask" ng-hide="!show">\
        </div>\
        <div class="table-center-table">\
          <div class="table-center-cell">\
            <form class="table-center-obj block show-transition-panel" name="pwd" ng-hide="!show" novalidate\
              ng-submit="submit()">\
              <div class="panel-header">\
                <div class="panel-avatar">\
                  <img ng-src="``theavatar || \'/static/images/default_avatar.png\'``">\
                </div>\
              </div>\
              <div class="panel-content">\
                <div class="form-control">\
                  <label>原始密码</label>\
                  <input type="password" name="origin" required ng-model="data.origin"\
                     ng-maxlength="16" ng-minlength="6" >\
                  <small class="error" ng-show="pwd.origin.$error.required">\
                    必填。\
                  </small>\
                  <small class="error" ng-show="pwd.origin.$error.minlength || pwd.origin.$error.maxlength">\
                    6-16个字符。\
                  </small>\
                </div>\
                <div class="form-control">\
                  <label>新的密码</label>\
                  <input type="password" name="password"\
                    required ng-maxlength="16" ng-minlength="6" ng-model="data.password">\
                  <small class="error" ng-show="pwd.password.$error.required">\
                    必填。\
                  </small>\
                  <small class="error" ng-show="pwd.password.$error.minlength || pwd.password.$error.maxlength">\
                    6-16个字符。\
                  </small>\
                </div>\
                <div class="form-control">\
                  <label>重复输入</label>\
                  <input type="password" name="repeat" required ng-model="data.repeat">\
                  <small class="error" ng-show="pwd.repeat.$error.required">\
                    必填。\
                  </small>\
                  <small class="error" ng-show="data.password != data.repeat && !pwd.repeat.$error.required">\
                    两次输入不一致。\
                  </small>\
                </div>\
                <small class="log">``log``</small>\
                <div class="operation">\
                  <input type="submit" class="shadowBtn" ng-model="data.repeat"\
                   ng-disabled="pwd.$invalid || data.password != data.repeat">\
                  <input type="button" class="shadowBtn cancel" ng-click="close()" value="取消"\
                    style="background-color:#cfd3d4"> \
                </div>\
              </div>\
            </form>\
          </div>\
        </div>\
      </div>\
      ',
      controller: 
			[ "$scope", "settings_api",
			function ($scope, settings_api) {
				"ngInject";
        $scope.close = function () {
          $scope.show = false;
        };
        $scope.data = {};
        $scope.submit = function () {
          settings_api.passwd($scope.data).then(function (resp) {
            if(resp.data.status) {
              $scope.log = "成功";
            } else {
              $scope.log = resp.data.error;
            }
          }, function () {
            $scope.log = "服务器错误";
          })
        };
      }],
      scope: {
        show: '=',
        theavatar: '='
      }
    }
  })
