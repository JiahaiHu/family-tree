var angular_module = require("./header.js").ng_module;
var $ = require("./header.js").jquery;

var angular = {};angular.module = function(param) {return angular_module;}
angular.module("param")
  .directive('plane', function () {
    return {
      template: '\
        <img class="plane-part ren" src="../../static/images/plane/ren.png">\
        <img class="plane-part feijitou" src="../../static/images/plane/feijitou.png">\
        <a class="plane-part login" href="javascript: void 0" ng-class="{auth:auth}"\
					ng-click="click()" title="``auth?\'\':\'登录/注册\'``">\
          <img src="../../static/images/plane/login.png">\
          <span class="login-icon">\
            ``auth?"Hi!":"Login"``\
          </span>\
        </a>\
        <img class="plane-part luoxuanjiang" src="../../static/images/plane/luoxuanjiang.png">\
      ',
      controller: function ($scope, $rootScope) {
        $scope.click = function () {
          if($rootScope.auth) {
            return
          }
          $scope.popLogin();
        }
      }
    }
  })
  .directive('groupList', function () {
    /**
     * 为了定义一个可运动的对象
     * 可以滚轮驱动
     * 也可用于手机触屏拨动
     *
     * 本来可以用scrollbar实现的，让其不显示
     * 但火狐不能定制，所以自己造轮子
     */
    return {
      replace: true,
      template: '\
      <div>\
        <div class="mask mask-left" ng-show="maskShow"></div>\
        <div style="transform: translate(``delta``%,0)" class="move-obj">\
          <div class="group" ng-repeat="group in groups">\
            ``group``\
            <i class="close iconfont" ng-click="remove($index)" ng-if="!disabled">&#xe606;</i>\
          </div>\
        </div>\
        <div class="mask mask-right" ng-show="maskShow"></div>\
      </div>\
      ',
      scope: {
        groups: '=',
        //number 为每屏最多容纳个数
        number: '@',
        disabled: '='
      },
      controller: function ($scope, $element, $timeout) {
        $scope.maskShow = false;
        $scope.delta = 0;
        var moveObj = $('.move-obj');
        var containerWidth;
        $element.on('mousewheel DOMMouseScroll', function (e) {
          containerWidth = $($element).width();
          if(!$scope.maskShow) return;
          e.preventDefault();
          if(e.detail > 0 || e.deltaY > 0) {
            $scope.delta+=10;
            if($scope.delta > 0) $scope.delta = 0;
          } else {
            var moveObjWidth = moveObj.width();
            var maxTranslate = (containerWidth - moveObjWidth) / moveObjWidth * 100;
            $scope.delta-=10;
            if($scope.delta < maxTranslate) $scope.delta = maxTranslate;
          }
          $scope.$apply();
        });

        $scope.remove = function (index) {
          $scope.groups.splice(index, 1);
        };

        $scope.$watch("groups", function (newValue, oldValue) {
          if(!newValue) return;

          var len = $scope.groups.length;
          $timeout(function () {

            var lastEle = $element[0].getElementsByClassName("group")[len-1];
            var right = lastEle.offsetLeft + lastEle.offsetWidth;

            $timeout(function () {
              containerWidth = $($element).width();
              var width = $element[0].offsetWidth;
              var moveObj = $('.move-obj', $element);
              if(right > width) {
                $scope.maskShow = true;
                $scope.delta = (containerWidth - moveObj.width()) / moveObj.width() * 100;
              } else {
                $scope.maskShow = false;
                $scope.delta = 0;
              }
              /*
              $scope.maskShow = right > width;
              if(newValue.)
              moveObj.css({transform: "translate(0)"});
              */
            }, 0);
          }, 0);
        }, true);
      }
    }
  })
  .directive('cloud', function($timeout, $animate) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        //value:'='
      },
      templateUrl: function(elem, attr) {
        return '../../static/components/cloud'+ attr.value +'.html';
      }
    }
  })
  .animation('.xxx', function() {
    return {
      beforeAddClass: function(element, className, done) {
        console.log(className)
        if (className === 'switching') {
          console.log(angular.element().ajax)
          element.find('.x')
          console.log(element.css)
          element.css({opacity: 0});
        }
      },
      afterAddClass: function(element) {
        console.log(1);
        if (className === 'switching') {
        }
      }
      //animate: function(element, ) {

      //}
    }
  })
