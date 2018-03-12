var angular_module = require("./header.js").ng_module;

var angular = {};angular.module = function(param) {return angular_module;}
angular.module("param")
	.directive("resetPanel", function() {
	return {
		replace: true,
		template: '\
					<form class="table-center-obj block show-transition-panel" name="pwd" novalidate\
              ng-submit="submit()">\
              <div class="panel-content">\
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
                </div>\
              </div>\
            </form>\
		',
		scope: {},
		controller: function($scope, account, $routeParams, $interval, $location) {
			var token = $routeParams.token;

			$scope.submit = function() {
				account.reset(token, {
					password: $scope.data.password
				}).then(function(resp) {
					if(resp.data.status) {
						var i = 3;
						$scope.log = "重置成功, " + i + " 秒后跳转至首页";
						$interval(function() {
							i--;
							$scope.log = "重置成功, " + i + " 秒后跳转至首页";
							if(i === 0) {
								$location.url("/");
							}
						}, 1000);
					} else {
						$scope.log = resp.data.error;
					}
				}, function(resp){
					$scope.log = "服务器错误，请联系管理员";
				});
			};
		},
	};
});
