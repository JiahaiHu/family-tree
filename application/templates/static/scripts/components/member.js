var angular_module = require("./header.js").ng_module;
var $ = require("./header.js").jquery;

var angular = {};angular.module = function(param) {return angular_module;}
angular.module("param")
  .directive('groupSwitcher', [function () {
    return {
      replace: true,
      template: '\
        <div class="switcher-mask modal-mask" ng-class="{show:show}" ng-show="play">\
          <div class="switcher-switcher modal-modal">\
            <div class="switcher-icon">\
              <img src="/static/images/group1.png">\
              <span>``curr_name``</span>\
            </div>\
            <div class="modal-title">提示</div>\
            <p class="modal-info">\
              ``curr_name``组拆分为<span ng-repeat="item in list.li">``item.group_name``, </span>\
              选择一个组别继续浏览\
            </p>\
            <ul class="switcher-list" ng-class="{selected:list.selected}">\
              <li ng-repeat="item in list.li">\
                <!--``item``-->\
                <input name="group" type="radio" ng-model="list.selectedId" ng-value="$index" \
                  ng-change="list.selected=true;select()">\
                <div>\
                  <img ng-src="``\'/static/images/group\'+$index+\'.png\'``">\
                  <span>``item.group_name``</span>\
                </div>\
                <div class="group-name">``item.group_name``</div>\
              </li>\
            </ul>\
            <!--<div class="btn-group" data-number="1">\
              <button class="shadowBtn"\
                ng-class="{cancel:!list.selected,primary:list.selected}"\
                ng-click="select()" ng-disabled="!list.selected">确定</button>\
            </div>-->\
          </div>\
          <!--<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="display:none">\
            <defs>\
              <filter id="grey-filter">\
                <feColorMatrix in="SourceGraphic" mode="matrix" values="\
                  0 0 0 0 0  \
                  0 0 0 0 0  \
                  0 0 0 0 0  \
                  0 0 0 0.1 0">\
                </feColorMatrix>\
              </filter>\
            </defs>\
          </svg>-->\
        </div>\
      ',
      controller: function ($scope, $timeout) {
        $scope.list = {};
        $scope.toggle = function (obj) {
          $scope.play = true;
          $scope.list.li = obj.list;
          $scope.curr_name = obj.current_name;
          $scope.show = true;
        };
        $scope.select = function () {
					console.log($scope.choose);
          $scope.choose($scope.list.selectedId);
          $scope.show = false;

          $timeout(function () {
            $scope.play = false;
          }, 300);
        };
      },
      scope: {
        choose: '=',
        toggle: '='
      }
    }
  }])
  .directive('memberMap', function () {
    return {
      template: '\
        <ol id="square">\
          <li ng-repeat="row in positionMap" class="memberRows"\
            ng-class="{odd: $odd, even: $even, last: $last}" ng-init="p_index=$index">\
            <a ng-repeat="item in row" class="member" ng-class="{show:dataArr[item]}"\
             ng-href="``dataArr[item]?\'/#/detail?user_id=\'+dataArr[item].user_id:\'javascript:void 0\'``"\
             > \
              <img ng-src="``dataArr[item].avatar || \'/static/images/default_avatar.png\'``">\
              <span class="user-name">``dataArr[item].username``</span>\
            </a>\
          </li>\
        </ol>\
        <div year-animation="" yearlist="yearlist" current="year" func="func" canscroll="canscroll"></div>\
      ',
      controller: function () {
      }
    }
  })
  .directive('memberMap2', function () {
    return {
      template: '\
        <div></div>\
      ',
      scope: {

      }
    }
  })
  .directive('groupMergeFlash', function () {
    return {
      replace: true,
      template: '\
      <div ng-class="{show:show}" ng-show="play">\
        <div class="merge-left">\
          <img src="/static/images/group0.png">\
          <span class="group-name">``target``</span>\
        </div>\
        <div class="merge-right">\
          <h4 class="merge-title">提示</h4>\
          <p class="merge-content">从 ``from`` 组跳转至 ``target`` 组</p>\
        </div>\
      </div>\
      ',
      scope: {
        toggle: '='
      },
      controller: function ($scope, $timeout) {
        $scope.toggle = function (info) {
          $scope.target = info.target;
          $scope.from = info.from;

          $scope.play = true;
          $scope.show = true;
          $timeout(function () {
            $scope.play = false;
            $scope.show = false;
          }, 2000);
        };
      }
    }
  })
