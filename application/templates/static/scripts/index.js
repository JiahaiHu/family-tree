require ('./angular.min.js');
require ('./angular-route.min.js');
require ('./angular-animate.min.js');
require ('./lodash.min.js');
require ('./restangular.min.js');
require ('./ajax.js');
require ('./angular-cookies.js');

require('./components.js');
var $ = require ('jquery');
require ('../styles/app.scss');
require ('../styles/index.scss');
require ('../styles/fill.scss');
require ('../styles/member.scss');
require ('../styles/me.scss');
require ('../styles/modify.scss');
require ('../styles/detail.scss');
require ('../styles/animate.css');

$.fn.extend({
  animateCss: function (animationName, callback) {
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    $(this).addClass('animated ' + animationName).one(animationEnd, function() {
      if(callback) {
        callback();
      }
    });
  }
});

var app = angular.module('app', ['ajax', 'ngRoute', 'components', 'ngCookies'])
  //为了解决 angular 与 tornado 模板渲染标志 {{}} 的冲突，
  //将angular 中的 {{value}} 替换为 [[value]]
  .config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('``');
    $interpolateProvider.endSymbol('``');
  })
  .config([
		"$compileProvider",
	function($compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
  }])
  .factory("Auth", [
			"$cookieStore", "ACCESS_LEVELS", "$rootScope",
	function ($cookieStore, ACCESS_LEVELS, $rootScope) {
    var judgeObj;

    var updateJudgeObj = function () {
      var _user = $cookieStore.get("sessid") ? true : false;
      var _is_cmp = $cookieStore.get("fmt_ibc") === 1;

      if(_user) {
        $rootScope.auth = true;
      }

      if(_user && _is_cmp) {
        //if all exist, the user has completed
        judgeObj = ACCESS_LEVELS.user_cmp;
      } else if(_user) {
        //if just _user, the user has not completed
        judgeObj = ACCESS_LEVELS.user;
      } else {
        //has not logined
        judgeObj = ACCESS_LEVELS.pub;
      }
    };

    return {
      logout: function () {
        $cookieStore.remove('fmt_ibc');
        $cookieStore.remove('id');
        $cookieStore.remove('sessid');
      },
      completeBasic: function () {
        $cookieStore.put("fmt_ibc", 1);
      },
      setId: function (id) {
        $cookieStore.put("id", id);
      },
      getId: function () {
        return parseInt($cookieStore.get("id"));
      },
      isCompleted: function () {
        updateJudgeObj();
        if(judgeObj === ACCESS_LEVELS.user_cmp) {
          return true;
        }
      },
      isAuthorized: function (lvl) {
        /**
         * 1 can visit 1
         * 2 can visit 1, 2
         * 3 can visit 1, 3
         */
        updateJudgeObj();
        var value;
        if(judgeObj >= lvl) {
          //直接跳转
          value = 1;
          console.log("直接跳转");
        } else if(judgeObj === ACCESS_LEVELS.pub) {
          //没登录的登录
          value = 2;
        } else {
          //登录了的完善
          console.log("完善");
          value = 3;
        }
        return value;
      }
    }
  }])
  .constant("ACCESS_LEVELS", {
    pub: 1,
    user: 2,
    user_cmp: 3
  })
  .filter('trustHtml', function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input);
    }
  })
  .filter('groups', function () {
    return function(input) {
      try {
        return input.replace(/#20[0-9]{2}/, '');
      } catch (e){
        console.log(e)
      }
    }
  })
  .controller('IndexController', ['$scope', '$timeout', 'Auth', '$location', '$rootScope',
    function ($scope, $timeout, Auth, $location, $rootScope) {

      $scope.switchToRegister = function () {
        $scope.show = false;
        $timeout(function () {
          $scope.registerShow = true;
        }, 500);
      };
      $scope.switchToLogin = function () {
        $scope.registerShow = false;
        $timeout(function () {
          $scope.show = true;
        }, 500);
      };
			$scope.switchToForget = function(){
        $scope.show = false;
        $timeout(function () {
          $scope.forgetShow = true;
        }, 500);
			};

      var login = function () {
        $scope.registerShow = false;
        $scope.show = true;
      };
      $scope.$on('login', function () {
				$scope.maskShow = true;
        login();
      });
      $scope.$on('$routeChangeStart', function (evt, next, curr) {
				if(!next.$$route) return;
        var authorVal = Auth.isAuthorized(next.$$route.access_level);
        if(authorVal === 2) {
          evt.preventDefault();
          login();
        } else if(authorVal === 3) {
          evt.preventDefault();
          $location.url('important_info');
        }
      });
      $scope.$on('$routeChangeSuccess', function (evt, current) {
				if(!current.$$route) return;
        switch (current.$$route.originalPath) {
          case '/me':
            $scope.me = true;
            break;
          default:
            $scope.me = false;
        }
      });

      $scope.logout = function () {
        Auth.logout();
        $rootScope.auth = false;
        $location.url('/');
      };
    }])
  .controller('MemberController', ['$scope', '$interval', '$timeout', 'render_api', '$location', '$window',
    function($scope, $interval, $timeout, render_api, $location, $window) {
      //人员存储容器
      var yearIndexList = {
        yearList: {},
        add: function (obj) {
          if(this.yearList[obj.year]) {
            this.yearList[obj.year].push({
              group_id: obj.group_id,
              members: obj.members,
              group_name: obj.group_name
            });
          } else {
            this.yearList[obj.year] = [
              {
                group_id: obj.group_id,
                members: obj.members,
                group_name: obj.group_name
              }
            ];
          }
        },
        _construct_from: function (current_group) {
          var from = current_group.group_from;
          for(var i in from) {
            id2obj($scope.data[from[i]]);
            this._construct_from($scope.data[from[i]]);
          }
        },
        _construct_to: function (current_group) {
          var to = current_group.group_to;
          for(var i in to) {
            id2obj($scope.data[to[i]]);
            this._construct_to($scope.data[to[i]]);
          }
        },
        construct: function (current_group) {
          //构造这个数据结构，让树成为每次年几个组的情况
          //$scope.data 表示组别数组

          id2obj(current_group);
          this._construct_from(current_group);
          this._construct_to(current_group);
        }
      };

      /**
       * 目前两年相同的话，会出现问题，由于没有变化而出现不可预料的事情
       * 主要出现在 “有几年没有人注册,都是空的” 的情况
       */
      //拿到组别及年份
      $scope.group_id = $location.search().group_id;
      $scope.year = parseInt($location.search().year);

      $scope.data = null;
      $scope.current_group_data = null;
      $scope.all_users = {};
      $scope.users = {};
      $scope.yearlist = [];
      $scope.canscroll = true;
      $scope.dataArr = [];

      //将使用id表示变为使用obj表示
      var id2obj = function (group) {
        var list = group.years;
        for(var year in list) {
          for(var user in list[year]) {
            list[year][user] = $scope.all_users[list[year][user]];
          }

          var has = false;
          for(var i in $scope.yearlist) {
            if($scope.yearlist[i] === parseInt(year)) {
              has = true;
              break;
            }
          }
          if(!has) {
            $scope.yearlist.push(parseInt(year));
          }

          yearIndexList.add({
            year: year,
            group_id: group.group_id,
            group_name: group.group_name,
            members: list[year]
          });
        }
      };

      render_api.timeline().then(function (resp) {
        if(resp.data.status) {
          //所有组别，$scope.data[id]即引用这个组
          $scope.data = resp.data.message.groups;
          //所有队员，$scope.all_users[id]即引用这个人
          $scope.all_users = resp.data.message.users;
          $scope.current_group_data = $scope.data[$scope.group_id];
          var curr_group = $scope.current_group_data;

          yearIndexList.construct(curr_group);
          $scope.yearlist.sort();
					console.log($scope.yearlist);

          var current_users = yearIndexList.yearList[$scope.year];
					console.log($scope.year);

          //拷贝，不能赋值,否则在dataArr改变时，users[0]会变
          //$scope.dataArr = $scope.users[$scope.year];
          for(var i in current_users[0].members) {
            $scope.dataArr.push(current_users[0].members[i]);
          }

          console.log(yearIndexList)
        }
      });

      $scope.switcherList = [];
      $scope.switchGroup = null;
      $scope.func = function (obj) {
        var year = null;
        if(obj && obj.year) year = obj.year;
        var users, users_clone;
        if(year) $scope.year = year;
        $scope.canscroll = false;

        //next数组，里面可能有一个或多个组
        var nextGroupArr = yearIndexList.yearList[$scope.year];
        if(nextGroupArr.length === 1) {
          obj.callback();

          //如果next数组中只有一个，则说明要立即切换

          //是否闪现消息
          if(nextGroupArr[0].group_id !== $scope.current_group_data.group_id) {
            $scope.mergeFlash({
              target: nextGroupArr[0].group_name,
              from: $scope.current_group_data.group_name
            });
          }

          //获得用户
          users = nextGroupArr[0].members;

          users_clone = [];
          for(var i in users) {
            users_clone[i] = users[i];
          }

          $scope.current_group_data = $scope.data[nextGroupArr[0].group_id];

          //进行交换
          $scope.changeMember(null, users_clone, 200);
          //必须有，否则canscroll反应不及时
          if(!year) $scope.$apply();

        } else {
          //如果不止一个，看有没有当前这个

          var hasCurrent = 0;
          //console.log(nextGroupArr, $scope.current_group_data)
          for(var i in nextGroupArr) {
            if(nextGroupArr[i].group_id === $scope.current_group_data.group_id) {
              hasCurrent = i;
              break;
            }
          }
          if(hasCurrent) {
            obj.callback();

            //获得用户
            users = nextGroupArr[hasCurrent].members;

            users_clone = [];
            for(var i in users) {
              users_clone[i] = users[i];
            }

            //进行交换
            $scope.changeMember(null, users_clone, 200);
            //必须有，否则canscroll反应不及时
            if(!year) $scope.$apply();
          } else {
            /**
             * 先把 switcher 的 list 改变
             * 然后弹出
             */
            $scope.switcher({
              list: nextGroupArr,
              current_name: $scope.current_group_data.group_name
            });
            $scope.canscroll = false;

            //充当选择的回调函数
            $scope.switchGroup = function (index) {
              $scope.canscroll = true;
              obj.callback();

              users = nextGroupArr[index].members;
              users_clone = [];
              for(var i in users) {
                users_clone[i] = users[i];
              }

              $scope.current_group_data = $scope.data[nextGroupArr[index].group_id];

              //进行交换
              $scope.changeMember(null, users_clone, 200);
              
            };
            if(!year) $scope.$apply();
          }
        }
      };

      //内容放在这里
      $scope.dataArr = [];
      $scope.positionMap = [
        [29, 22, 16, 14, 20, 28, 31],
        [26,  9,  5,  1,  8, 13, 25],
        [23, 10,  4,  0,  2, 18, 32],
        [27, 12,  6,  3,  7, 11, 24],
        [30, 33, 17, 15, 19, 21, 34]
      ];

      $scope.positionMap2 = [];
      for(var i in $scope.positionMap) {
        for(var j in $scope.positionMap[i]) {
          $scope.positionMap2[$scope.positionMap[i][j]] = parseInt(i) * 7 + parseInt(j);
        }
      }

      /*
       $window.onpopstate = function (e) {
       if($location.path()==="/member") {
       console.log(e)
       //$window.history.replaceState(1, 's');
       }
       };
       */
      $scope.changeMember = function (oldArr, newArr, intervalTime) {
        /*var state = {*/
          //group_id: 3,
          //year: 2015
        //};
        /*$window.history.pushState(state, document.title);*/
        $scope.ele = $('.member');
        var toBeDelIndex = [];

        /*
         console.log("--------------------------");

         for(var i in $scope.dataArr) {
         console.log($scope.dataArr[i]);
         }
         console.log("--------------------------");

         for(var i in newArr) {
         console.log(newArr[i]);
         }
         console.log("--------------------------");
         */

        for(var i in $scope.dataArr) {
          var same = false;
          for(var j in newArr) {
            //发现一个相等的，说明没有变，将它在新数组中剔除
            if($scope.dataArr[i] === newArr[j]) {
              newArr.splice(j, 1);
              same = true;
              break;
            }
          }
          //没有找到相等的，说明它将从列表中抹除，将它push入toBeDelIndex中
          if(!same && $scope.dataArr[i] !== null) {
            //if($scope.dataArr[i] !== null) {
            toBeDelIndex.push(i);
            //}
          }
        }

        var i = 0;
        var common = true;
        var delta = newArr.length - toBeDelIndex.length;
        var min = Math.min(newArr.length, toBeDelIndex.length);
        var max = Math.max(newArr.length, toBeDelIndex.length);
				
				/**
				 * eventArr 是一个事务队列
				 * 队列中的对象是个三元组
				 * index: 目标位置
				 * newObj: 新对象
				 * type: 1(替换), 2(新增), 3(删除)
				 */
				var eventArr = [];
				var toBeDelLen = toBeDelIndex.length;

				/**
				 * 现在开始构造事务队列
				 */
				if(newArr.length <= toBeDelLen) {
					// 除了替换之外，还要另外做删除
					for(var i = 0; i < newArr.length; i++) {
						eventArr.push({
							index: toBeDelIndex[i],
							newObj: newArr[i],
							type: 1
						});
					}
					toBeDelIndex.splice(0, newArr.length);
					for(var i in toBeDelIndex) {
						eventArr.push({
							index: toBeDelIndex[i],
							newObj: null,
							type: 3
						});
					}
				} else {
					// 除了替换之外，还要新增
					for(var i = 0; i < toBeDelLen; i++) {
						eventArr.push({
							index: toBeDelIndex[i],
							newObj: newArr[i],
							type: 1
						});
					}

					newArr.splice(0, toBeDelLen);
					var j = 0;
					for(var i in newArr) {
						for(; ;j++) {
							if(!$scope.dataArr[j]) {
								eventArr.push({
									index: j,
									newObj: newArr[i],
									type: 2
								});
								j++;
								break;
							}
						}
					}
				}

				if(eventArr.length === 0) $scope.canscroll = true;

        var interval;
        var end = false;

				var i = 0;
				var finishedNum = 0;
        var intervalFunc = function () {
					if(i >= eventArr.length) {
						$interval.cancel(interval);
						return;
					}

					var obj = eventArr[i];
					switch(obj.type) {
						case 1:
							$($scope.ele[$scope.positionMap2[obj.index]]).animateCss('bounceOut', function () {
								$scope.dataArr[obj.index] = obj.newObj;
								$($scope.ele[$scope.positionMap2[obj.index]]).removeClass('bounceOut');
								$($scope.ele[$scope.positionMap2[obj.index]]).animateCss('bounceIn');

								finishedNum++;
								if(finishedNum === eventArr.length) {
									$scope.canscroll = true;
								}
								$scope.$apply();
							});
							break;
						case 2:
							$scope.dataArr[obj.index] = obj.newObj;
							$($scope.ele[$scope.positionMap2[obj.index]]).removeClass('bounceOut');
							$($scope.ele[$scope.positionMap2[obj.index]]).animateCss('bounceIn');
							finishedNum++;
							if(finishedNum === eventArr.length) {
								$scope.canscroll = true;
							}
							break;
						case 3:
							$($scope.ele[$scope.positionMap2[obj.index]]).animateCss('bounceOut', function () {
								$scope.dataArr[obj.index] = null;
								finishedNum++;
								if(finishedNum === eventArr.length) {
									$scope.canscroll = true;
								}
								$scope.$apply();
							});
							break;
						default:
					}
					i++;
        };

        //解决第一次缓冲时间
        intervalFunc();
        interval = $interval(intervalFunc, intervalTime);
      };
    }])
  .controller('HomeController', ['$scope', '$interval','$timeout', 'common',
    function($scope, $interval, $timeout, common){
      $scope.popLogin = function () {
        $scope.$emit('login');
      };

      //没有变化的动作
      var animation_not_change = function(obj) {
        obj.animating = true;
        $timeout(function() {
          //obj.small = true;
          $($('.group')[obj]).animateCss('pulse');
        }, 1);
        $timeout(function() {
          //obj.small = false;
          $($('.group')[obj]).removeClass('pulse');
          $scope.canscroll--;
          console.log($scope.canscroll)
          $timeout(function() {
            //obj.animating = false;
          }, 800);
        }, 800);
      };

      //有变化的动作
      var animation_change = function (obj, flag, newObj) {
        //flag === true 表示只进入
        //flag === false 表示只移出
        if(flag === null) {
          //又进又出
          obj.animating = true;
          $timeout(function() {
            obj.small = true;
          }, 1);
          $timeout(function() {
            obj.body = newObj;
            obj.small = false;
            $scope.canscroll--;
            $timeout(function() {
              obj.animating = false;
            }, 800);
          }, 800);
        } else if (flag === true) {
          //只进入
          obj.animating = true;
          $timeout(function() {
            obj.body = newObj;
            obj.small = false;
            $scope.canscroll--;
          }, 1);
          $timeout(function() {
            obj.animating = false;
          }, 800);
        } else {
          //只出去
          obj.small = true;
          $scope.canscroll--;
          $timeout(function() {
            obj.animating = false;
          }, 800);
        }
      };

      var compare_group = function (old_arr, new_arr) {
        //一个有body，一个没有，要改
        var old_len = old_arr.len;
        var new_len = new_arr.len;

        if(old_len !== new_len) {
          return false;
        }

        //已经默认两个数组排序相同
        for(var i = 0; i < old_len; i++) {
          if(old_arr[i].body.group_id !== new_arr[i].group_id) {
            return false;
          }
        }
        return true;
      };

      //$scope.year = new Date().getFullYear();
      $scope.year = 2016;
      $scope.yearlist = [];
      $scope.canscroll = 0;
      $scope.func = function (obj) {
        var year = null;
        if(obj && obj.year) year = obj.year;
        obj.callback();

        //console.log(year)
        if(year) $scope.year = year;
        //$scope.$apply();
        //$scope.dataArr = $scope.users[$scope.year];
        var oldArr = $scope.dataArr;
        var newArr = $scope.users[$scope.year];

        //console.log(oldArr, newArr)
        if(compare_group(oldArr, newArr)) {
          //如果组别没有变动
          //就只抖一抖
          var j = 0;
          var animateionFunc = function () {
            animation_not_change(j);
            j++;
          };
          $scope.canscroll++;
          //console.log($scope.canscroll)
          animateionFunc();
          if (j !== $scope.dataArr.len) {
            var int = $interval(function() {
              $scope.canscroll++;
              //console.log($scope.canscroll)
              animateionFunc();
              console.log(j, $scope.dataArr.len)
              if (j == $scope.dataArr.len) {
                $interval.cancel(int);
              }
            }, 200);
          }
        } else {
          //如果组别变了

          var delta = newArr.len - oldArr.len;
          var min, max;
          if(delta > 0) {
            min = oldArr.len;
            max = newArr.len;
          } else {
            max = oldArr.len;
            min = newArr.len;
          }

          //important
          oldArr.len = newArr.len;

          var i = 0, common = true;
          var func2 = function () {
            var k = i;
            if(common) {
              animation_change($scope.dataArr[k], null, $scope.users[$scope.year][k]);
            } else {
              if(delta > 0) {
                animation_change($scope.dataArr[k], true, $scope.users[$scope.year][k]);
              } else if(delta < 0){
                animation_change($scope.dataArr[k], false, $scope.users[$scope.year][k]);
              } else {
              }
              if(k >= max - 1) {
                $interval.cancel(interval);
              }
            }
            if(i === min - 1) {
              common = false;
            }
            i++;
          };
          $scope.canscroll++;
          func2();
          var interval = $interval(function () {
            $scope.canscroll++;
            func2();
          }, 200);
        }
      };

      $scope.groups = [];
      $scope.users = {};
      $scope.dataArr = [
        {
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        },{
          animating: false,
          small: true,
          body: null
        }
      ];
      common.group({}).then(function (resp) {
        if(resp.data.status) {
          $scope.groups = resp.data.message.groups;
          //var currentYear = new Date().getFullYear();
					var currentYear = resp.data.message.current_period;
          for(var i in $scope.groups) {
            var startYear = $scope.groups[i].start_year;
            var endYear = $scope.groups[i].end_year || currentYear;
            for(var year = startYear; year <= endYear; year++) {
              if($scope.users[year]) {
                $scope.users[year].push($scope.groups[i]);
              } else {
                $scope.users[year] = [$scope.groups[i]];
              }
            }
          }

          //var group_num = $scope.groups.length;
          for(var i in $scope.users) {
            $scope.yearlist.push(parseInt(i));
						console.log(parseInt(i));

            $scope.users[i].len = $scope.users[i].length;
            //给每一年补齐组数
            //if($scope.users[i].length < )
          }

          //不可使用for in 因为会把len属性给迭代出来
          for(var i = 0; i < $scope.users[$scope.year].len; i++) {
            $scope.dataArr[i].body = $scope.users[$scope.year][i];
            $scope.dataArr[i].small = false;
          }
          $scope.dataArr.len = $scope.users[$scope.year].length;
        } else {
        }
      });

      /*
       //彩蛋部分
       var surprise = new Surprise({
       minSpeed: 1000,
       maxSpeed: 5000,
       decrement: 500,
       criticalValue: 1000
       });

       var interval = $interval(function() {
       surprise.frict();
       console.log(surprise.getSpeed());
       }, 200);

       $scope.listenMouse = function(e) {
       var addition = Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2);
       if (addition > surprise.criticalValue) {
       surprise.quicken(addition / 100);
       }
       };

       //离开此页面时将定时器销毁
       $scope.$on('$destroy', function() {
       $interval.cancel(interval);
       });
       */
    }])
  .controller('MeController', ['$scope', 'render_api', '$window', '$timeout',
    function($scope, render_api, $window, $timeout){
      var projects;
      var friends = [];

      var panelWidth = 270;
      var panelHeight = 307;
      var panelLeft, panelTop;

      $scope.panelFocus = false;

      var move = function (context) {
        var e = context.e;
        var index = context.index;
				var type = context.type;

        $scope.friend = $scope[type][index];

        var space = 20;
        var right = e.x + panelWidth;
        var bottom = e.y + panelHeight;
        var ele_data = getComputedStyle(e.target.parentNode);

        var size = parseFloat(ele_data.width.replace("px", ""));
        var ele_left = parseFloat(ele_data.left.replace("px", ""));
        var ele_right = ele_left + size;
        var ele_top = parseFloat(ele_data.top.replace("px", ""));

        //处理x坐标
        //如果超过了right边界
        if(right > $window.innerWidth) {
          panelLeft = ele_left - space - panelWidth;
        } else {
          panelLeft = ele_right + space;
        }

        //处理y坐标
        //如果超过了bottom边界
        if(bottom > $window.innerHeight) {
          panelTop = ele_top + size - panelHeight;
        } else {
          panelTop = ele_top;
        }

        $scope.panelLeft = panelLeft;
        $scope.panelTop = panelTop;
        $scope.panelFocus = true;
      };

      var hide = function () {
        $scope.panelFocus = false;
      };

      var throttle = function (func, context) {
        $timeout.cancel(func.tId);
        func.tId = $timeout(function () {
          func(context, context);
        }, 800);
      };

      $scope.showPanel = function(e, type, index) {
				if(!$scope[type][index].projects) {
					return;
				}
        throttle(move, {e: e, index: index, type: type});
      };
      $scope.hidePanel = function () {
        $timeout.cancel(move.tId);
        throttle(hide, null);
      };

      $scope.mentorField = [31, 32, 33, 37, 38, 39];
      $scope.menteeField = [34, 29, 30, 40, 35, 36];

      render_api.homepage({}).then(function (resp) {
        if(resp.data.status) {
          projects = resp.data.message.programs;
          $scope.self_info = resp.data.message.personal;
					$scope.self_groups = resp.data.message.groups;
					$scope.current_year = resp.data.message.current_period;

          var relationship = resp.data.message.relation;
          $scope.mentors = relationship.mentors;
          $scope.mentees = relationship.mentees;

					//剔除 mentor/mentee
					
          for(var i in projects) {
            var members = projects[i].member;
            for(var j in members) {
              //剔除自己
              if(members[j].user_id === $scope.self_info.user_id) {
                continue;
              }

              var index = -1;
              for(var k in friends) {
                if(friends[k].user_id === members[j].user_id) {
                  index = k;
                  break;
                }
              }
              //说明已经有了
              if(index > -1) {
                friends[index].projects.push(projects[i]);
              } else {
                friends.push({
                  avatar: members[j].avatar,
                  user_id: members[j].user_id,
                  username: members[j].username,
                  projects: [
                    projects[i]
                  ]
                });
              }
            }
          }
          //console.log(friends)
					
					//将 friends 中是 mentor/mentee 的拿出来
					for(var i in friends) {
						for(var j in $scope.mentees) {
							if(friends[i].user_id === $scope.mentees[j].user_id) {
								$scope.mentees[j] = friends[i];
								friends.splice(i, 1);
								break;
							}
						}
						for(var j in $scope.mentors) {
							if(friends[i].user_id === $scope.mentors[j].user_id) {
								console.log(friends[i].user_id, $scope.mentors[j].user_id);
								$scope.mentors[j] = friends[i];
								friends.splice(i, 1);
								break;
							}
						}
					}

          friends.sort(function (a, b) {
            return b.projects.length - a.projects.length;
          });
          $scope.friends = friends;

          $scope.test = [
            3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28
          ];
        }
      });
    }])
  .controller('detailController', ['$scope', 'render_api', '$location', '$rootScope', '$timeout', 'Auth',
    function($scope, render_api, $location, $rootScope, $timeout, Auth){
      $scope.$on('setId', function (e, project_id) {
        $scope.data.programs[$scope.data.programs.length-1].program_id = project_id;
      });
      $scope.$on('grant', function (e, project_id) {
        $scope.$broadcast('grant2', project_id);
      });
      $scope.$on('grantShow', function (e, data) {
        $scope.grantShow(data);
      });
      $scope.$on('modalShow', function (e, data) {
        $scope.modal(data);
      });
      $scope.$on('projectDel', function (e, project_id) {
        //遍历项目数组找到被删除的项目
        var projects = $scope.data.programs;
        for(var i = 0; i < projects.length; i++) {
          if(projects[i].program_id === project_id) {
            projects.splice(i, 1);
            break;
          }
        }
      });
      $scope.data = {
        personal: null,
        groups: null,
        programs: []
      };
      var newProject = {
        status: false
      };

      $scope.$on('createProjectFinished', function (e) {
        newProject.status = false;
      });
      var scrollToBottom = function (callback) {
        var ele = $('.fullScreenContainer');
        var height = ele[0].scrollHeight - ele.height();
        var currentScrollTop = ele.scrollTop();
				var time = height - currentScrollTop;
        ele.animate({"scrollTop": height}, time > 500? 500: time, function () {
          if(callback) {
            callback();
          }
        });
      };

      $scope.addProject = function () {
        if(newProject.status) {
          //说明已经有一个打开中的新项目
					scrollToBottom(function () {
						$scope.$emit('modalShow', {
							title: "提示",
							info: "请先完成已经打开的新项目",
							btns: [
								{
									text: "确认"
								}
							]
						});
					});
				} else {
					$scope.data.programs.push({
						logo: "/static/images/photo_S_project.png",
            is_admin: true,
            newproject: true,
            member: [
              {
                user_id: $scope.data.personal.user_id,
                avatar: $scope.data.personal.avatar,
                username: $scope.data.personal.username
              }
            ],
            year: +new Date().getFullYear()
          });
          newProject.status = true;
          $timeout(function () {
            scrollToBottom();
          }, 100);
					console.log($scope.data.programs);
        }
      };

      var user_id = $location.search().user_id;
      var json;
      if (user_id) {
        json = {
          user_id: user_id
        };
      } else {
        json = {
        };
      }

      render_api.homepage(json).then(function (resp) {
        var data = resp.data;
        if(data.status) {
          $scope.data = data.message;
					/*
          if($scope.data.relation.mentees.length === 0) {
            $scope.data.relation.mentees.push({
              username: "暂无"
            });
          }
					*/

          $rootScope.self_id = Auth.getId();

          if($rootScope.self_id == user_id || !user_id) {
            //不能使用===，因为一个是整型，一个是字符串
            $scope.self = true;
          }

          /*
           var programs = data.message.programs;
           for(var i in programs) {
           var arr = [];
           for(var j in programs[i].member) {
           arr.push(programs[i].member[j]);
           }
           $scope.data.project.projectMember.push(arr);
           }
           */
          //对项目进行处理，将队长放在第一个
          var projects = data.message.programs;
          for(var i in projects) {
            var members = projects[i].member;
            for(var j in members) {
              if(members[j].user_id === projects[i].admin_id) {
                var tmp = members[0];
                members[0] = members[j];
                members[0].is_admin = true;
                members[j] = tmp;
                break;
              }
            }
          }
          $scope.data.programs = projects;
        } else {
          $scope.$emit('modalShow', {
            title: "错误",
            info: data.error,
            btns: [
              {
                text: "确认"
              }
            ]
          });
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
    }])
  .controller('informationController', [
		'$scope', 'render_api', 'settings_api', '$window', '$rootScope', '$location',
		function ($scope, render_api, settings_api, $window, $rootScope, $location) {
			$scope.$on('modalShow', function (e, data) {
				$scope.modal(data);
			});
			//广播点击事件，给要失去焦点消失的元素使用
			$($window).on('click', function (e) {
				$scope.$broadcast('clickBlur', e.target);
			});

			//监听要alert的信息，广播给alert
			$scope.$on('info_emit', function (e, data) {
				$scope.$broadcast('alertFromPage', data);
			});

			$scope.func = {
				saveBasic: function () {
					//var deferred = $q.defer();
					var groups = [];
					var pattern = /([a-zA-Z\u4e00-\u9fa5]+)([0-9]{4})/;
					var personal = $scope.data.personalSettings;
					for(var i in personal.groups) {
						var group = personal.groups[i].replace(pattern, "$1#$2");
						groups.push(group);
					}
					var info = {
						blog: personal.blog,
						wechat_id: personal.wechat_id,
						location: personal.location,
						groups: groups,
						is_graduated: personal.is_graduated
					};

					settings_api.personal({
						info: JSON.stringify({settings:info})
					})
						.then(function (resp) {
							if(resp.data.status) {
								$scope.basicDisabled = true;
								$scope.settings_changed = false;
								//deferred.resolve();
							} else {
								$scope.$emit('modalShow', {
									title: "错误",
									info: resp.data.error,
									btns: [
										{
											text: "确认"
										}
									]
								});
							}
						}, function () {
							$scope.$emit('modalShow', {
								title: "错误",
								info: "服务器错误，请与管理员联系",
								btns: [
									{
										text: "确认"
									}
								]
							});
						});
					//return deferred.promise;
				},
				saveRelation: function () {
					var mentors = $scope.data.relation.mentors;
					var mentorsId = [];
					for(var i in mentors) {
						mentorsId.push(mentors[i].user_id);
					}
					settings_api.mentor(
						{
							info: JSON.stringify({mentors: mentorsId})
						}
					)
						.then(function (resp) {
							if(resp.data.status) {
								//deferred.resolve();
								$scope.relationDisabled = true;
								$scope.relation_changed = false;
							} else {
								$scope.$emit('modalShow', {
									title: "错误",
									info: resp.data.error,
									btns: [
										{
											text: "确认"
										}
									]
								});
							}
						}, function () {
							$scope.$emit('modalShow', {
								title: "错误",
								info: "服务器错误，请与管理员联系",
								btns: [
									{
										text: "确认"
									}
								]
							});
						});
				},
				popGroupSelector: function () {
					$scope.status.maskShow = true;
					$scope.status.groupSelectShow = true;
				},
				addNewProject: function () {
					var newPro = {
						title: "",
						"year": new Date().getFullYear(),
						"description": "",
						"logo": "",
						"image": "",
						"is_admin": false,
						"admin_id": 2,
						"member": [
							$scope.data.personalSettings
						]
					};
					$scope.data.project.projects.push(newPro);
					$scope.data.project.projectMember.push([]);
				}
			};

			$scope.status = {
				panelShow: false,
				maskShow: false,
				groupSelectShow: false,
			};

			$scope.data = {
				personalSettings: null,
				groups: null,
				//mentor,mentee面板中的数据
				relation: null,
				//找人面板中的数据
				searchPanel: {
					paneldata: [],
					httpData: null
				},
				//项目中的数据
				project: {
					projects: [],
					projectMember: []
				}
			};

			var basicBak;
			var relationBak = [];

			var arrayCopy = function (origin, target) {
				target.length = 0;
				for(var i in origin) {
					target[i] = origin[i];
				}
			};

			$scope.basicDisabled = true;
			$scope.relationDisabled = true;
			$scope.editInfo = function () {
				var personal = $scope.data.personalSettings;

				basicBak = {
					wechat_id: personal.wechat_id,
					blog: personal.blog,
					is_graduated: personal.is_graduated,
					location: personal.location,
					groups: []
				};
				arrayCopy(personal.groups, basicBak.groups);

				$scope.basicDisabled = false;
			};
			$scope.infoCancel = function () {
				console.log(basicBak)
				for(var i in basicBak) {
					if(basicBak[i] instanceof Array) {
						arrayCopy(basicBak[i], $scope.data.personalSettings[i]);
					} else {
						$scope.data.personalSettings[i] = basicBak[i];
					}
				}
				$scope.basicDisabled = true;
			};
			$scope.editRelation = function () {
				var relation = $scope.data.relation;

				arrayCopy(relation.mentors, relationBak);

				$scope.relationDisabled = false;
			};
			$scope.relationCancel = function () {
				arrayCopy(relationBak, $scope.data.relation.mentors);
				$scope.relationDisabled = true;
			};

			var listen = function() {
				$scope.$watch("data.personalSettings", function(newValue, oldValue) {
					if (newValue !== oldValue) {
						$scope.settings_changed = true;
					}
				}, true);
				$scope.$watch("data.relation", function(newValue, oldValue) {
					if (newValue !== oldValue) {
						$scope.relation_changed = true;
					}
				}, true);
			};

			$window.addEventListener("beforeunload", function (event) {
				if($scope.settings_changed || $scope.relation_changed) {
				  event.returnValue = "\o/";
				}
			});

			$scope.$on('$routeChangeStart', function(evt, next, current){
				if($scope.settings_changed || $scope.relation_changed) {
					$scope.$emit('modalShow', {
						title: "提示",
						info: "你有未保存的更改，是否仍然要离开此页？",
						btns: [
							{
								text: "离开",
								func: function() {
									console.log(next, current);
									$scope.settings_changed = false;
									$scope.relation_changed = false;
									$location.url(next.$$route.originalPath);
								}
							},
							{
								text: "取消"
							}
						]
					});
					evt.preventDefault();
				}
			});

			$scope.$on('$destroy', function(e) {
				$window.removeEventListener("beforeunload");
			});

				render_api.homepage({}).
				then(function (resp) {
					var data = resp.data;
					if(data.status) {
						$scope.data.personalSettings = data.message.personal;
						$scope.data.personalSettings.groups = data.message.groups;
						/*
				if(data.message.relation.mentees.length ===0) {
					data.message.relation.mentees.push(
						{
							user_id: -1,
							username: "暂无",
							avatar: null
						}
					);
				}
				*/
						$scope.data.relation = data.message.relation;
						/*
						//从网上拉下来的项目成员信息需要记录下来
						//因为当需要删除成员的时候,如果自己不是管理员，不能删除已有成员，只能删除暂存的添加
						//当save提交了之后，需要更新已有成员列表
				var programs = data.message.programs;
				for(var i in programs) {
					var arr = [];
					for(var j in programs[i].member) {
						arr.push(programs[i].member[j]);
					}
					$scope.data.project.projectMember.push(arr);
				}

						//对项目进行处理，将队长放在第一个
				var projects = data.message.programs;
				for(var i in projects) {
					console.log(projects[i])
					var members = projects[i].member;
					for(var j in members) {
						if(members[j].user_id === projects[i].admin_id) {
							var tmp = members[0];
							members[0] = members[j];
							members[0].is_admin = true;
							members[j] = tmp;
							break;
						}
					}
				}
				 $scope.data.project.projects = data.message.programs;
				 */

					//通知已经获得信息，现在开始再改变，就是认为改的
						$scope.$broadcast('get_info', null);
						listen();
			} else {
				$scope.$emit('modalShow', {
					title: "错误",
					info: data.error,
					btns: [
						{
							text: "确认"
						}
					]
				});
			}
		}, function () {
			$scope.$emit('modalShow', {
        title: "错误",
        info: "服务器错误，请与管理员联系",
        btns: [
          {
            text: "确认"
          }
        ]
      });
    });
  }])
  .controller('importantController',
    ['$scope', '$rootScope', 'render_api', 'account', '$window', '$location', '$q', 'Auth',
      function ($scope, $rootScope, render_api, account, $window, $location, $q, Auth) {
        $scope.$on('modalShow', function (e, data) {
          $scope.modal(data);
        });
        //广播点击事件，给要失去焦点消失的元素使用
        $($window).on('click', function (e) {
          $scope.$broadcast('clickBlur', e.target);
        });
        $('#groupPanel').on('click', function (e) {
          e.originalEvent.stopPropagation();
        });

        $scope.func = {
          panelClickFilter: function (arr, exist, isadmin) {
            var self_id = $scope.data.personal.user_id;
            $rootScope.self_id = self_id;
            var len = arr.length;
            if(exist) {
              //如果存在exist这一项，就说明肯定是在改项目

              //如果自己是管理员
              //那么需要筛选掉自己
              if(isadmin) {
                for(var i  = 0; i < len; i++) {
                  if(arr[i].user_id === self_id) {
                    arr[i].forbidden = true;
                    //选到了自己肯定就结束了
                    return;
                  }
                }
                return;
              } else {
                //如果自己不是管理员
                //那么需要筛选掉已经有的人
                for(var i  = 0; i < len; i++) {
                  for (var j = 0; j < exist.length; j++) {
                    if(arr[i].user_id === exist[j].user_id) {
                      arr[i].forbidden = true;
                      break;
                    }
                  }
                }
                return;
              }
            } else {
              //否则是在编辑mentor
              //则不能选择自己
              for(var i  = 0; i < len; i++) {
                console.log(arr[i].user_id, self_id)
                if(arr[i].user_id === self_id) {
                  arr[i].forbidden = true;
                  //选到了自己肯定就结束了
                  return;
                }
              }
            }
          }
        };
        $scope.status = "提交";
        $scope.data = {};
        $scope.base64 = null;

        var sendReq = function () {
          var deferred = $q.defer();
          //-mentors-------
          var mentors = [];
          var mentorRefer = $scope.data.relation.mentors;
          for(var i in mentorRefer) {
            mentors.push(mentorRefer[i].user_id);
          }
          //-groups--------
          var groups = [];
          var pattern = /([a-zA-Z\u4e00-\u9fa5]+)([0-9]{4})/;
          var groupRefer = $scope.data.personal.groups;
          for(var i in groupRefer) {
            groups.push(groupRefer[i].replace(pattern, "$1#$2"));
          }
          //-settings-------
          var settings = {
            avatar: $scope.base64,
            blog: $scope.data.personal.blog,
            is_graduated: $scope.data.personal.is_graduated,
            wechat_id: $scope.data.personal.wechat_id,
            location: $scope.data.personal.location
          };

          var obj = {
            mentors: mentors,
            groups: groups,
            settings: settings
          };

          account.basicInfo({info: JSON.stringify(obj)}).then(function (resp) {
            if(resp.data.status) {
              deferred.resolve();
            } else {
              deferred.reject(resp.data.error);
            }
          }, function (resp) {
            deferred.reject(resp);
          });
          return deferred.promise;
        };

        var validate = function () {
          var deferred = $q.defer();
          if(!$scope.data.personal.groups.length) {
            deferred.reject("组别必须填写");
          }
          if(!$scope.data.relation.mentors.length) {
            deferred.reject("Mentor 必须填写");
          }

          var projects = $scope.data.projects;
          var invalidIndex = -1;
          for(var i = 0; i < projects.length; i++) {
            if(!projects[i].title || !projects[i].description) {
              invalidIndex = i;
              break;
            }
          }
          if(invalidIndex === -1 ) {
            deferred.resolve();
          } else {
            deferred.reject("第"+i+"个项目数据输入非法");
          }

          return deferred.promise;
        };

        $scope.submit = function () {
          validate().then(function () {
            $scope.status = "提交...";
            sendReq().then(function () {
              Auth.completeBasic();

              var successfulProjectNum = 0;
              var projects = $scope.data.projects;

							if(projects.length === 0) {
								$location.url("/detail");
							} else {
								for(var i = 0; i < projects.length; i++) {
									var newObj = {
										year: projects[i].year,
										title: projects[i].title,
										description: projects[i].description,
										member: []
									};
									if(projects[i].imagebase64) {
										newObj.image = projects[i].imagebase64;
									}
									if(projects[i].base64) {
										newObj.logo = projects[i].base64;
									}
									for(var j in projects[i].member) {
										newObj.member.push(projects[i].member[j].user_id);
									}
									account.step2({info: JSON.stringify(newObj)}).then(function () {
										successfulProjectNum++;
										if(successfulProjectNum === projects.length) {
											console.log("成功");
											$location.url("/detail");
										}
									});
								}
							}
            }, function (error) {
              //console.log(error)
              $scope.$emit('modalShow', {
                title: "错误",
                info: error,
                btns: [
                  {
                    text: "确认"
                  }
                ]
              });
            });
          }, function (error) {
            //console.log(error)
            $scope.$emit('modalShow', {
              title: "错误",
              info: error,
              btns: [
                {
                  text: "确认"
                }
              ]
            });
          });
        };

        render_api.homepage({}).then(function (resp) {
          if(resp.data.status) {
            $scope.data = resp.data.message;
            $scope.data.personal.groups = $scope.data.groups;
            $scope.data.projects = [];
            console.log($scope.data);
          } else {
            $scope.$emit('modalShow', {
              title: "错误",
              info: "服务器错误，请与管理员联系",
              btns: [
                {
                  text: "确认"
                }
              ]
            });
          }
        }, function () {
          $scope.$emit('modalShow', {
            title: "错误",
            info: "服务器错误，请与管理员联系",
            btns: [
              {
                text: "确认"
              }
            ]
          });
        });

        $scope.selectorShow = false;

        $scope.popGroupSelector = function (e) {
          e.stopImmediatePropagation();
          $scope.selectorShow = true;
        };

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

        $scope.addProject = function () {
          /*
           if(newProject.status) {
           //说明已经有一个打开中的新项目
           scrollToBottom(function () {
           alert(1)
           });
           } else {
           */
          $scope.data.projects.push({
            //newproject: true,
            member: [
              {
                user_id: $scope.data.personal.user_id,
                avatar: $scope.data.personal.avatar,
                username: $scope.data.personal.username
              }
            ],
            year: +new Date().getFullYear()
          });
          /*
           newProject.status = true;
           $timeout(function () {
           scrollToBottom();
           }, 100);
           */
          //}
        };
      }])
	.controller('resetController', function($scope) {})
  .config(['$routeProvider', 'ACCESS_LEVELS', function($routeProvider, ACCESS_LEVELS) {
    $routeProvider
      .when('/', {
        templateUrl: 'static/views/home.html',
        controller: 'HomeController',
        access_level: ACCESS_LEVELS.pub
      })
			.when('', {
				templateUrl: 'static/views/home.html',
				controller: 'HomeController',
				access_level: ACCESS_LEVELS.pub
			})
      .when('/me', {
        templateUrl: 'static/views/me.html',
        controller: 'MeController',
        access_level: ACCESS_LEVELS.user_cmp
      })
      .when('/member', {
        templateUrl: 'static/views/member.html',
        controller: 'MemberController',
        access_level: ACCESS_LEVELS.pub
      })
      .when('/detail', {
        templateUrl: 'static/views/detail.html',
        controller: 'detailController',
        access_level: ACCESS_LEVELS.user_cmp
      })
      .when('/information', {
        templateUrl: 'static/views/information.html',
        controller: 'informationController',
        access_level: ACCESS_LEVELS.user_cmp
      })
      .when('/important_info', {
        templateUrl: 'static/views/important_info.html',
        controller: 'importantController',
        access_level: ACCESS_LEVELS.user
      })
			.when('/account/reset/:token', {
				templateUrl: 'static/views/reset.html',
				controller: 'resetController',
				access_level: ACCESS_LEVELS.pub
			})
      .otherwise({
        redirectTo: '/'
      });
  }])
	//.run(function ($rootScope, Auth) {});
