/**
 * Created by mingtao on 4/16/16.
 */
angular.module('myAnimation', ['ngAnimate'])
  .directive('myHide', function ($animate) {
    return{
      link: function (scope, ele, attrs) {
        $animate['addClass'](ele, 'ng-show');
      }
    }
  })
