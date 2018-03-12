var angular_module = require("./header.js").ng_module;
var $ = require("./header.js").jquery;
var clone = require("./header.js").clone;

var angular = {};angular.module = function(param) {return angular_module;}

angular.module("param")
  .directive('suggestionInput', function(common) {
    return {
      restrict: 'AE',
      scope: {
        value: '=ngModel',
        placeholder: '@'
      },
      require: 'ngModel',
      template:
        '<input placeholder="``placeholder``" ng-blur="show=false"\
        ng-change="onInput(300)" ng-model="value">\
        <ul ng-init="show=false" ng-show="show">\
					<li ng-repeat="(group,members) in list" ng-show="record">\
						<div class="groupname">``group``</div>\
						<ul>\
							<li ng-repeat="member in members" class="username">\
								<a href="javascript: void 0" ng-mousedown="redirect(member.user_id)">``member.username``</a>\
							</li>\
						</ul>\
					</li>\
					<div ng-show="!record" class="no-result">\
						<img src="/static/images/ic_no_result.png">\
						<div>无搜索结果</div>\
					</div>\
        </ul>',
      controller: function($scope, $location, $element) {
        $scope.redirect = function (user_id) {
          $location.url("detail?user_id=" + user_id);
        };
        $scope.show = true;
				$element.on('mousewheel keydown', function(e) {
					e.stopPropagation();
				});
        $scope.onInput = (function() {
          var timer;
          return function (time) {
            if(timer) {
              return false;
            }
            if($scope.value === '') {
              $scope.show = false;
              return false;
            }
            timer = setTimeout(function() {
              common.search({
                keyword: $scope.value
              }).then(function (resp) {
                var data = resp.data;
                if(data.status) {
									var isEmpty = true;
									for(var i in data.message) {
										isEmpty = false;
										break;
									}
									if(isEmpty) {
										$scope.record = false;
									} else {
										$scope.list = data.message;
										$scope.record = true;
									}
									$scope.show = true;
								} else {
                }
              });
              timer = null;
            }, time);
          };
        })();
      }
    }
  })
  .directive('yearAnimation', function($timeout, $interval) {
    return {
      restrict: 'AE',
      template: '\
      <div class="dotContainer">\
        <div class="dotSec"  ng-repeat="year in yearlist" ng-class="{selected: current2==year}">\
          <a href="javascript:void 0" class="dot"\
             ng-click="dotClick($index)">\
             <span class="year">``year``</span>\
             <img src="../../static/images/ic_year.png" class="yellow-back">\
          </a>\
        </div>\
      </div>\
      ',
      scope: {
        yearlist: '=',
        current: '=',
        func: '=',
        canscroll: '='
      },
      controller: function($scope, $element, $window, $document) {
        $scope.current2 = $scope.current;

        //console.log($scope)
        //事件节流
        /*var time = function() {
          //var timer = false;
          //return function () {
            //if(timer) return false;
            //timer = true;
            //setTimeout(function () {
              //timer = false;
            //}, 30);
            //return true;
          //}
        /*};*/

        $window.onkeydown = function (e) {
					console.log($scope.canscroll);
          if (!$scope.canscroll/* || !time()*/) return;
          if(e.keyCode === 40) {
            //向下
            //不可改成===
            if($scope.current == $scope.yearlist[$scope.yearlist.length-1]) return;
            $scope.current++;
          } else if (e.keyCode === 38) {
            if($scope.current == $scope.yearlist[0]) return;
            $scope.current--;
          } else {
            return;
          }
					console.log(3);
          $scope.$apply();
          $scope.func({callback: function () {
            $scope.current2 = $scope.current;
          }});
        };
        $window.onmousewheel = function (e) {
          if (!$scope.canscroll/* || !time()*/) return;
          if(e.deltaY > 0) {
            if($scope.current == $scope.yearlist[$scope.yearlist.length-1]) return;
            $scope.current++;
          } else {
            if($scope.current == $scope.yearlist[0]) return;
            $scope.current--;
          }
          $scope.$apply();
          $scope.func({callback: function () {
            $scope.current2 = $scope.current;
          }});
        };
        $scope.dotClick = function(index) {
          if ($scope.yearlist[index] == $scope.current) return;
          $scope.current = $scope.yearlist[index];
          //current 没有成功传递，是angular的bug？
          $scope.func({
            year: $scope.current,
            callback: function () {
              $scope.current2 = $scope.current;
            }
          });
        };

        $scope.$on('$destroy', function() {
          $window.onmousewheel = null;
          $window.onkeydown = null;
        });
      }
    }
  })
.directive('modal', function () {
    return {
      replace: true,
      template: '\
        <div class="modal-mask" ng-class="{show:show}" ng-show="!remove">\
          <div class="modal-modal">\
            <div class="modal-icon">!</div>\
            <div class="modal-title">``data.title``</div>\
            <p class="modal-info">``data.info``</p>\
            <div class="btn-group" data-number="``data.btns.length``">\
              <button class="shadowBtn" ng-repeat="btn in data.btns"\
                ng-class="{cancel:!btn.func,primary:btn.func}"\
                ng-click="click(btn.func)">``btn.text``</button>\
            </div>\
          </div>\
        </div>\
      ',
      scope: {
        modal: '='
      },
      controller: [ "$scope", "$timeout", function ($scope, $timeout) {
        $scope.remove = true;
        $scope.show = false;

        $scope.modal = function (data) {
          $scope.data = data;
					console.log(data);
          $scope.remove = false;
          $scope.show = true;
        };
        $scope.close = function () {
          $scope.show = false;
          $timeout(function () {
            $scope.remove = true;
          }, 300);
        };
        $scope.click = function (func) {
          if(func) {
            try {
              //如果需要等待执行完毕的
              //失败就不关闭了，如果需要不关闭的，就reject掉
              func().then(function () {
                $scope.close();
              });
            } catch (e) {
              //如果不需要等待执行完毕,直接关闭
              console.log(e);
              $scope.close();
            }
          } else {
            $scope.close();
          }
        }
      }]
    }
  })
  .directive('confirm', function () {
    return {
      replace: true,
      template: '\
        <div ng-show="show" class="hide-delay">\
          <div mask="" class="show-transition-mask" ng-hide="!show"></div>\
          <div class="table-center-table"> \
            <div class="table-center-cell"> \
              <div class="alert-panel table-center-obj show-transition-panel" ng-hide="!show">\
                <div class="alert-head">\
                  提示信息\
                </div>\
                <div class="alert-body">\
                  <div class="alert-content">\
                    ``content``\
                  </div>\
                  <button ng-click="close()" ng-disabled="disabled">取消</button>\
                  <button ng-click="execute()" ng-disabled="disabled">确定</button>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      ',
      scope: {
        show: '=',
        func: '='
      },
      controller: function ($scope) {
        $scope.disabled = false;
        $scope.execute = function () {
          $scope.disabled = true;
          $scope.func().then(function () {
            $scope.disabled = false;
            $scope.close();
          }, function () {
            $scope.disabled = false;
            $scope.close();
          });
        };
        $scope.close = function () {
          $scope.show = false;
        };
      }
    }
  })
  .directive('projectMemberList', ['account', function(account) {
    return {
      template:
        '<div class="peopleContainer">\
          <div member-list="" members="members" number="``number``"></div>\
          <div class="person" ng-click="popEditor(members,exist,isadmin)" ng-if="!disabled"> \
            <div class="addPersonalLogo">  \
              <i class="iconfont">&#xe65f;</i>\
            </div>  \
          </div>  \
        </div>  \
        <div mask></div> \
        <div member-search-panel paneldata="panelData" ng-show="panelShow" show="panelShow"></div>\
        '
    ,
      scope: {
        members: '=',
        data:'=',
        func: '=',
        disabled: '=',
        exist: '=',
        isadmin: '=',
        number: '@'
      },
      controller: function($rootScope, $scope, $element, $attrs) {
        var self_id = $rootScope.self_id;
        var panelClickFilter = function (arr, exist, isadmin) {
          var len = arr.length;
          if(exist) {
            //如果存在exist这一项，就说明肯定是在该项目

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
              if(arr[i].user_id === self_id) {
                arr[i].forbidden = true;
                //选到了自己肯定就结束了
                return;
              }
            }
          }
        };
        /*
        popEditor: function (variant, exist, isadmin) {
          //利用panelClickFilter将一些禁止点击的flag加进数组中，
          //以便ng-repeat能使用它们决定成员是否能被删除
          this.panelClickFilter(variant, exist, isadmin);

          $scope.data.searchPanel.paneldata = variant;
          $scope.status.maskShow = true;
          $scope.status.panelShow = true;
        }
        */
        $scope.popEditor = function (variant, exist, isadmin) {
					$scope.panelData = clone(variant);
          //利用panelClickFilter将一些禁止点击的flag加进数组中，
          //以便ng-repeat能使用它们决定成员是否能被删除
          panelClickFilter($scope.panelData, exist, isadmin);

          $scope.panelShow = true;
        };

        $scope.panelShow = false;

				$scope.panelData = [];
				$scope.$on('memberSelected', function() {
					$scope.members.length = 0;
					for(var i in $scope.panelData) {
						// 将方法也遍历进去了
						if(!$scope.panelData[i].user_id) continue;
						$scope.members.push($scope.panelData[i]);
					}
				});
      }
    }
  }])
  .directive('memberInSearchPanel', [function () {
    return{
      template: "\
      <img ng-src='``member.avatar``' class='member-logo'>\
      <span class='member-name'>``member.username``</span>\
      <span class='iconfont'></span>\
      ",
      scope: {
        member: "="
      }
    }
  }])
  .directive('memberSearchPanel', [function () {
    return{
      replace: true,
      template: '\
      <div class="hide-delay">\
        <div mask="" class="show-transition-mask" ng-hide="!show"></div> \
        <div class="table-center-table">\
          <div class="table-center-cell">\
            <div style="z-index:33" class="table-center-obj show-transition-panel" ng-hide="!show">\
              <input class="search-input" placeholder="搜索团队成员" ng-model="value" ng-change="onInput(500)">\
              <div class="selected-member-container">\
                <ul>\
                  <li class="selected-member" ng-repeat="member in paneldata" ng-class="{forbidden:member.forbidden}">\
                    <img ng-src="``member.avatar``" class="member-logo">\
                    <i class="close iconfont" ng-click="removePerson(member)">&#xe606;</i>\
                  </li>\
                </ul>\
              </div>\
              <div class="member-container">\
                <div class="group" ng-repeat="(group,groupMembers) in httpData">\
                  <div class="group-name">\
                    ``group``\
                  </div>\
                  <ul>\
                    <li ng-repeat="person in groupMembers | filter: selfFilter" \
                    ng-class="{notLast:!$last,selected:inArray(person,paneldata),forbidden:person.forbidden}" \
                    ng-click="clickPerson(group,$index)"\
                    member-in-search-panel="" member="person" class="member">\
                    </li>\
                  </ul>\
                </div>\
              </div>\
							<div class="btn-container">\
								<button ng-click="submit()" class="confirm">确定</button>\
								<button ng-click="show=false" class="confirm">取消</button>\
							</div>\
            </div>\
          </div>\
        </div>\
      </div>\
      ',
      scope: {
				paneldata: '=',
				show: '='
			},
      controller: function ($scope,$timeout, common, $rootScope) {
				// 自己不能删除自己
        $scope.selfFilter = function (item) {
          if(item.user_id === $rootScope.self_id) {
            return item.forbidden = true;
          }
          return item;
        };
        //从服务端拉取数据
        $scope.onInput = (function() {
          var timer;
          return function (time) {
            if(timer) {
              return false;
            }
            timer = setTimeout(function() {
              common.search({
                keyword: $scope.value
              }).then(function (resp) {
                var data = resp.data;
                if(data.status) {
                  $scope.httpData = data.message;
                } else {
                }
              });
              timer = null;
            }, time);
          };
        })();

        var inArray = function (arr) {
          for(var i in arr) {
            if(arr[i].user_id == this.user_id) {
              arr.splice(i, 1);
              return true;
            }
          }
          return false;
        };

        $scope.inArray = function (item, arr) {
          for(var i in arr) {
            if(arr[i].user_id == item.user_id) {
              if(arr[i].forbidden) {
                item.forbidden = true;
              }
              return true;
            }
          }
          return false;
        };

        //点击人物触发添加或去除
        $scope.clickPerson = function (group, index) {
          var person = $scope.httpData[group][index];
          //不允许被点击的
          if(person.forbidden) {
            return;
          }
          if(!inArray.call(person, $scope.paneldata)) {
            $scope.paneldata.push(person);
          }
        };

        $scope.removePerson = function (person) {
          if(person.forbidden) {
            return;
          }
          inArray.call(person, $scope.paneldata);
        };

        //关闭panel
        $scope.submit = function () {
					$scope.$emit('memberSelected');
          $scope.show = false;
        };
      }
    }
  }])
  .directive('cropperFileLoader', function () {
    return {
      template: '\
        <input type="file" ng-disabled="disable">\
        <button class="shadowBtn" ng-disabled="disable">``fileName?fileName:"选择图片"``</button>\
      ',
      controller: function ($scope, $element, img2base64) {
        var inputEle = $($element.find("input")[0]);
        var fileReader = new FileReader();
        var rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

        inputEle.on('change', function () {
          if (rFilter.test(this.files[0].type)) {
            fileReader.readAsDataURL(this.files[0]);
          } else {
            alert("图片格式错误");
          }
        });
        $scope.image = new Image();
        fileReader.onload = function (e) {
          $scope.image.src = e.target.result;
          $scope.$apply();
        };
      },
      scope: {
        image: '='
        /*
        base64: '=',
        base64comp: '=',
        disable: "="
        */
      }
    }
  })
  .directive('imgCropper', function () {
    return{
      replace: true,
      template: '\
      <div ng-show="show" class="hide-delay">\
        <div mask="" ng-hide="!show" class="show-transition-mask"></div>\
        <div class="table-center-table">\
          <div class="table-center-cell">\
            <div class="table-center-obj show-transition-panel" ng-hide="!show">\
              <div class="img-cropper">\
                <div class="left part">\
                  <div class="cropper">\
                    <canvas class="canvasCrop" width="``imgSize.width``" height="``imgSize.height``"></canvas>\
                    <div class="cropper-mask" ng-class="{uninit:!init}">\
                      <div class="resize-btn"></div> \
                    </div> \
                  </div>\
                </div\
                ><div class="right part">\
                  <canvas class="canvasPreview" width="150" height="150"></canvas> \
                </div> \
              </div>\
              <div class="operation">\
                <!--<a href="javascript: void 0" ng-click="close()">取消</a>-->\
                <button class="shadowBtn" ng-click="close()" style="background-color:#9e9e9e">取消</button>\
                <div cropper-file-loader="" image="image"></div> \
                <button class="shadowBtn" ng-click="submit()" ng-disabled="!init">确定</button>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>\
      ',
      scope: {
        show: '=',
        output: '='
      },
      controller: function ($scope, $element, $timeout, $window) {
        $scope.init = false;
        $scope.image = null;
        $scope.close = function () {
          $scope.show = false;
        };

        var element = $($element);
        var cropper = element.find('.cropper');
        var resizeBtn = element.find('.resize-btn');
        var cropperMask = element.find('.cropper-mask');

        var canvasCrop = element.find('.canvasCrop')[0];
        var canvasPreview = element.find('.canvasPreview')[0];
        var ctx = canvasCrop.getContext("2d");
        var ctx1 = canvasPreview.getContext("2d");

        var animation = {
          move: false,
          resize: false
        };

        //data
        var mask = {
          top: 0,
          left: 0,
          height: 150,
          width: 150
        };

        $scope.imgSize = {
          width: 0,
          height: 0
        };

        var containerSize = {
          width: 300,
          height: 300
        };

        //在选择部分绘图
        $scope.$watch("image.src", function (newValue, oldValue) {
          if(!newValue) return;

          $scope.init = true;

          if($scope.image.width / $scope.image.height > containerSize.width / containerSize.height) {
            //宽度100%;
            $scope.imgSize.width = containerSize.width;
            $scope.imgSize.height = $scope.imgSize.width * $scope.image.height / $scope.image.width;
          } else {
            $scope.imgSize.height = containerSize.height;
            $scope.imgSize.width = $scope.imgSize.height * $scope.image.width / $scope.image.height;
          }
          cropper.css({
            height: $scope.imgSize.height,
            width: $scope.imgSize.width
          });

          if($scope.imgSize.width < 150) {
            mask.height = $scope.imgSize.width;
            mask.width = $scope.imgSize.width;
          } else if($scope.imgSize.height < 150) {
            mask.height = $scope.imgSize.height;
            mask.width = $scope.imgSize.height;
          }

          cropperMask.css({
            height: mask.height,
            width: mask.width
          });

          $timeout(function () {
            ctx.drawImage($scope.image, 0, 0, $scope.imgSize.width, $scope.imgSize.height);
            ctx1.drawImage(canvasCrop, 0, 0, 150, 150, 0, 0, 150, 150);
          }, 1)
        }, true);

        var move = (function () {
          return function (e) {
            if(!$scope.init) {
              return;
            }

            var deltaX = e.originalEvent.movementX;
            var deltaY = e.originalEvent.movementY;
            mask.top += deltaY;
            mask.left += deltaX;

            if(mask.left < 0) {
              mask.left = 0;
            } else if(mask.left + mask.width > $scope.imgSize.width) {
              mask.left = $scope.imgSize.width - mask.width;
            }
            if(mask.top < 0) {
              mask.top = 0;
            } else if(mask.top + mask.height > $scope.imgSize.height) {
              mask.top = $scope.imgSize.height - mask.height;
            }

            cropperMask.css({
              top: mask.top,
              left: mask.left
            });
            ctx1.clearRect(0, 0, 150, 150);
            ctx1.drawImage(canvasCrop, mask.left, mask.top, mask.width, mask.height, 0, 0, 150, 150);
          }
        })();
        cropperMask.on('mousedown', function () {
          animation.move = true;
          cropper.on('mousemove', move);
        });

        var resize = function (e) {
          if(!$scope.init) {
            return;
          }

          var deltaX = e.originalEvent.movementX;
          var deltaY = e.originalEvent.movementY;
          if(deltaX * deltaY < 0) return;

          mask.height += deltaY;
          mask.width += deltaY;

          var edgeX = false;
          var edgeY = false;
          if(mask.left + mask.width > $scope.imgSize.width) {
            edgeX = true;
          }
          if(mask.top + mask.height > $scope.imgSize.height) {
            edgeY = true;
          }
          if(edgeX || edgeY) {
            if(edgeX) {
              mask.width = $scope.imgSize.width - mask.left;
              mask.height = mask.width;
            }
            if(edgeY) {
              mask.height = $scope.imgSize.height - mask.top;
              mask.width = mask.height;
            }
          }

          cropperMask.css({
            width: mask.width,
            height: mask.height
          });
          ctx1.clearRect(0, 0, 150, 150);
          ctx1.drawImage(canvasCrop, mask.left, mask.top, mask.width, mask.height, 0, 0, 150, 150);
        };
        resizeBtn.on('mousedown', function (e) {
          e.originalEvent.stopPropagation();
          cropper.on('mousemove', resize);
          animation.resize = true;
        });
        $($window).on('mouseup', function () {
          if(animation.move) {
            cropper.off('mousemove');
            animation.move = false;
          } else if(animation.resize) {
            cropper.off('mousemove');
            animation.resize = false;
          }
        });

        $scope.submit = function () {
          $scope.output = canvasPreview.toDataURL();
          $scope.show = false;
        };
      }
    }
  })
  .directive('save', function () {
    return {
      template: "\
        <span class='iconfont' title='保存'>&#xe603;</span>\
      ",
      controller: function ($scope) {
      }
    }
  })
  .directive('alert', function () {
    return {
      replace: true,
      template: '\
        <div ng-show="show" class="hide-delay">\
          <div mask="" class="show-transition-mask" ng-hide="!show"></div>\
          <div class="table-center-table"> \
            <div class="table-center-cell"> \
              <div class="alert-panel show-transition-panel table-center-obj" ng-hide="!show">\
                <div class="alert-head">\
                  提示信息\
                </div>\
                <div class="alert-body">\
                  <div class="alert-content">\
                    ``content``\
                  </div>\
                  <button ng-click="close()">确定</button>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      ',
      controller: function ($scope) {
        $scope.show = false;
        $scope.content = "";
        $scope.$on('alertFromPage', function (e, data) {
          $scope.show = true;
          $scope.content = data;
        });
        $scope.close = function () {
          $scope.show = false;
        }
      }
    }
  })
  .directive("scroll", function ($window) {
    return function(scope, element, attrs) {
      $($window).bind("scroll", function() {
        scope.visible = false;
        scope.$apply();
      });
    };
  })
  .directive('avatar', function () {
    return {
      template: '\
      <img src="``avatar.personalSettings.avatar``">\
      <div class="mask">\
        <button class="shadowBtn" ng-click="showCropper()">更换头像</button>\
      </div>\
      <div img-cropper="" show="cropperShow" output="base64"></div>\
      \
      ',
			scope: {
				avatar: '='
			},
      controller: function ($scope, settings_api) {
        $scope.showCropper = function () {
          $scope.cropperShow = true;
        };
        $scope.base64 = null;
        $scope.$watch('base64', function (newVar) {
          if(newVar && newVar !== "") {
            var newVarCutted = newVar.split(',')[1];
            settings_api.avatar({
              avatar: newVarCutted
            }).then(function (resp) {
              if(resp.data.status) {
                $scope.avatar.personalSettings.avatar = newVar;
              } else {
              }
            }, function () {
            })
          }
        });
      }
    }
  })
  .directive('avatar2', function () {
    return {
      template: '\
      <img src="``thesrc``">\
      <div class="mask">\
        <button class="shadowBtn" ng-click="showCropper()">更换头像</button>\
       </div>\
      <div img-cropper="" show="cropperShow" output="output"></div>\
      \
      ',
      scope: {
        thesrc: '=',
        base64: '='
      },
      controller: function ($scope) {
        $scope.showCropper = function () {
          $scope.cropperShow = true;
        };
        $scope.base64 = null;
        $scope.$watch('output', function (newVar) {
          console.log(newVar)
          if(newVar && newVar !== "") {
            $scope.thesrc = newVar;
            $scope.base64 = newVar.split(',')[1];
            /*
            settings_api.avatar({
              avatar: newVar
            }).then(function (data) {
              console.log(data)
            })
            */
          }
        })
      }
    }
  })
  .directive('mask', function () {
    return {
      template: '\
      <div></div>\
      '
    }
  })
  .directive('memberList', [function () {
    return {
      replace: true,
      template: '\
      <div>\
        <div class="move-obj" style="transform: translate(``delta``%,0)">\
          <div class="person" ng-repeat="member in members" ng-class="{admin:member.is_admin}"> \
            <div class="personalLogo">  \
              <img ng-src="``member.avatar||\'../../static/images/default_avatar.png\'``">\
            </div>\
            <p>``member.username``</p>\
      			<span class="iconfont"></span>\
          </div>\
        </div>\
      </div>\
      ',
      scope: {
        members: '=',
        number: '@'
      },
      controller: function ($scope, $element) {
        $scope.delta = 0;
        var moveObj = $('.move-obj', $element);
        var containerWidth;
        $element.on('mousewheel DOMMouseScroll', function (e) {
          if(parseInt($scope.number) >= $scope.members.length) return;
          e.preventDefault();
          if(e.detail > 0 || e.deltaY > 0) {
            $scope.delta += 10;
            if($scope.delta > 0) $scope.delta = 0;
          } else {
            containerWidth = $($element).width();
            var moveObjWidth = moveObj.width();
            var maxTranslate = (containerWidth - moveObjWidth) / moveObjWidth * 100;
            $scope.delta -= 10;
            if($scope.delta < maxTranslate) $scope.delta = maxTranslate;
          }
          $scope.$apply();
        });
      }
    }
  }])
  .directive('projectLogo', function (img2base64) {
    return {
      template: '\
				<div class="project-logo-input">\
        	<input type="file" ng-disabled="disabled">\
					<div class="project-logo-plus">+</div>\
				</div>\
        <img src="``logo``">\
      ',
      controller: function ($scope, $element) {
        $scope.fileName='';
        var inputEle = $($element.find("input")[0]);
        inputEle.on('change', function () {
          $scope.file = this.files[0];
          $scope.fileName = $scope.file.name;
          img2base64($scope.file, function (result) {
            $scope.base64 = result.split(',')[1];
            $scope.logo = result;
            $scope.$apply();
          });

          $scope.$apply();
        })
      },
      scope: {
        base64: '=',
        logo: '=',
        disabled: '='
      }
    }
  })
  .directive('modifyHero', function () {
    return {
      template: '\
      <div class="personalLogo" avatar="thedata">\
      </div>\
      <h3>``thedata.personalSettings.username || "loading..."``</h3>\
      <p class="mail">``thedata.personalSettings.email || "loading..."``</p>\
      <button ng-click="showPwd()" class="shadowBtn">修改密码</button>\
      <div update-pwd-panel="" show="updatePwdShow" theavatar="thedata.personalSettings.avatar"></div>\
      ',
			scope: {
				thedata: '='
			},
      controller: function ($scope) {
        $scope.updatePwdShow = false;
        $scope.showPwd = function () {
          $scope.updatePwdShow = true;
        }
      }
    }
  })
	.directive('loginPanel', function () {
		return {
			replace: true,
			template: '\
				<form ng-submit="submit()">\
					<div class="header">\
					<h1 class="title">Login</h1>\
					<p class="greet" ng-show="status">Hello Again!</p>\
					<i class="iconfont close" ng-click="show=false;maskshow=false">&#xe606;</i>\
					</div>\
					<div class="body">\
					<div class="form-control">\
					<i class="iconfont">&#xe604;</i\
					><div class="bfc-container">\
					<input name="email" placeholder="Email" ng-model="formData.email" type="email" required>\
					</div>\
					</div>\
					<div class="form-control">\
					<i class="iconfont">&#xe605;</i\
					><div class="bfc-container">\
					<input name="password" type="password" placeholder="Password" ng-model="formData.password" required>\
					</div>\
					<span class="error notice">``error``</span>\
					</div>\
					<div>\
					<input type="submit" value="``state``" class="btn">\
					</div>\
					<div class="i-container">\
					<a style="margin-right: 20px" href="javascript: void 0" ng-click="switch()">Register</a>\
					<a href="javascript: void 0" ng-click="forget()">Forget the password?</a>\
					</div>\
					</div>\
				</form>\
				',
			scope: {
			switch: '=',
			forget: '=',
			show: '=',
			maskshow: '='
		},
			controller: [
				"$scope", "account", "$rootScope", "$timeout", "Auth", "$route", "$location",
			function ($scope, account, $rootScope, $timeout, Auth, $route, $location) {
				//normal:Login, wait:Login..., success
				$scope.state = "Login";

				$scope.error = "";

				$scope.formData = {
					email: "",
					password: ""
				};
				$scope.submit = function () {

					$scope.state = "Login...";
					account.login($scope.formData).then(function(resp) {
						if(resp.data.status) {
							$rootScope.auth = true;
							$scope.show = false;
							$scope.maskshow = false;

							Auth.setId(resp.data.message.user_id);
							if(Auth.isCompleted()) {
								$route.reload();
							} else {
								$location.url("/important_info");
							}
							/*
							$timeout(function () {
							$scope.state = "Login";
							}, 500);
							*/
						} else {
							$scope.state = "Login";
							$scope.error = resp.data.error;
							console.log(resp)
						}
					}, function(reason) {
						$scope.state = "Login";
						//$scope.error = reason.data;
						$scope.error = "服务器错误，请告知管理员";
						console.log(reason);
					});
				}
			}]
		}
	})
	.directive('registerPanel', function () {
		return {
			replace: true,
			template: '\
				<form ng-submit="submit()">\
				<div class="header" style="height: 70px">\
					<h1 class="title">Register</h1>\
					<i class="iconfont close" ng-click="show=false;maskshow=false">&#xe606;</i>\
				</div>\
				<div class="body" ng-class="{nextpage:slider==1}" style="height:415px">\
					<div class="slider">\
						<div class="page">\
							<div class="form-control">\
								<i class="iconfont">&#xe604;</i\
								><div class="bfc-container">\
									<input name="email" placeholder="Email" ng-model="formData.email" type="email" required>\
								</div>\
							</div>\
							<div class="form-control">\
								<i class="iconfont">&#xe607;</i\
								><div class="bfc-container">\
									<input name="username" placeholder="RealName" ng-model="formData.username" required>\
								</div>\
							</div>\
							<div>\
								<div class="form-control form-control-half">\
									<i class="iconfont">&#xe605;</i\
									><div class="bfc-container">\
										<input name="password" type="password" placeholder="Pwd(6-16)" ng-model="formData.password" required>\
									</div>\
									<span class="notice error">\
										``(!formData.password&&!formData.re_password)?"":(formData.password.length<6||formData.password.length>16)?"长度为6-16位":formData.password==formData.re_password?"":"两次密码输入不一致"``\
									</span>\
								</div\
								><div class="form-control form-control-half">\
									<div class="bfc-container">\
										<input name="password" type="password" placeholder="Repeat Input" ng-model="formData.re_password" required>\
									</div>\
								</div>\
							</div>\
							<div class="form-control">\
								<i class="iconfont">&#xe609;</i\
								><div class="bfc-container">\
									<input name="invite-code" placeholder="InviteCode(8 chars)" ng-model="formData.inv_code" required>\
								</div>\
								<span class="notice" ng-class="{error:status==\'error\',normal:status==\'normal\',info:status==\'info\'}"\
								>``error``</span>\
							</div>\
							<div>\
								<input type="submit" value="``state``" class="btn">\
							</div>\
							<div class="i-container">\
								<a href="javascript: void 0" ng-click="switch()">Login</a>\
							</div>\
						</div>\
						<div class="page">\
							<div style="margin-bottom:15px">\
								Email: ``tmp_email`` \
							</div>\
							<span class="notice" ng-class="{error:status1==\'error\',normal:status1==\'normal\',info:status1==\'info\'}"\
								style="top:0">``error1``</span>\
							<div class="ne-btn-group">\
								<button type="button" class="btn" ng-click="send_again()">Send Again</button>\
								<a href="javascript: void 0" ng-click="change_mail()">切换邮箱</a> \
							</div>\
						</div>\
					</div>\
				</div>\
				</form>\
				',
			scope: {
				switch: '=',
				show: '=',
				maskshow: '='
			},
			controller: [
				"$scope", "account", "$rootScope", "$timeout", "$location",
			function ($scope, account, $rootScope, $timeout, $location) {

				var error = function(content) {
					$scope.status = "error";
					$scope.error = content;
				}
				var info = function(content) {
					$scope.status = "info";
					$scope.error = content;
				}
				var error1 = function(content) {
					$scope.status1 = "error";
					$scope.error1 = content;
				}
				var info1 = function(content) {
					$scope.status1 = "info";
					$scope.error1 = content;
				}

				$scope.slider = 0;

				//normal:Login, wait:Login..., success
				$scope.state = "Register";
				$scope.error = "";

				$scope.formData = {
					email: "",
					password: "",
					inv_code: "",
					username: ""
				};
				$scope.submit = function () {
					$scope.tmp_email = $scope.formData.email;
					
					//验证密码
					if($scope.formData.password !== $scope.formData.re_password) {
						error("两次密码输入不一致");
						return;
					}

					$scope.state = "Registering...";
					account.register($scope.formData).then(function (resp) {
						if(resp.data.status) {
							switch(resp.data.state) {
								case 0:
									info("注册成功，登录中");
									account.login($scope.formData).then(function(resp) {
										if(resp.data.status) {
											$scope.state = "Register";
											$location.url("/important_info");
											$scope.show = false;
											$scope.maskshow = false;
										}
										/*
								$scope.show = false;
								$timeout(function () {
								$scope.state = "Register";
								}, 500);
								*/
									});
									break;
								case 1:
									$scope.slider = 1;

									info1("注册邮件已发送, 未收到可再次发送");
									break;
								case 2:
									$scope.slider = 1;

									error1("注册邮件发送失败, 点击手动发送");
									break;
								default:
							}
						} else {
							$scope.state = "Register";
							error(resp.data.error);
							//console.log(resp)
						}
					}, function (reason) {
						$scope.state = "Register";
						//$scope.error = reason.data;
						error("服务器错误，请告知管理员");
						//console.log(reason);
					});
				};
				$scope.send_again = function() {
					account.validate({
						email: $scope.tmp_email
					})
					.then(function(resp) {
						if(resp.data.status) {
							info1("注册邮件已发送, 未收到可再次发送");
						} else {
							error1(resp.data.error);
						}
					});
				};
				$scope.change_mail = function() {
					$scope.slider = 0;
				};
			}]
		}
	})
	.directive('forgetPwdPanel', function(){
		return {
			replace: true,
			template: '\
				<form ng-submit="submit()">\
					<div class="header" style="height: 70px">\
						<h1 class="title">Reset Password</h1>\
						<i class="iconfont close" ng-click="show=false;maskshow=false">&#xe606;</i>\
					</div>\
					<div class="body">\
						<div class="form-control">\
							<i class="iconfont">&#xe604;</i\
							><div class="bfc-container">\
								<input name="email" placeholder="Email" ng-model="formData.email" type="email" required>\
							</div>\
							<span class="notice" \
								ng-class="{error:status==\'error\',normal:status==\'normal\',info:status==\'info\'}">\
								``error``\
							</span>\
						</div>\
						<div>\
							<input type="submit" value="``state``" class="btn">\
						</div>\
					</div>\
				</form>\
			',
			scope: {
				show: '=',
				maskshow: '='
			},
			controller: [
				"$scope", "account",
			function($scope, account) {
				$scope.state = "Send Email";
				$scope.status = "normal";
				$scope.submit = function () {
					$scope.state = "Sending...";
					account.forget($scope.formData).then(function (resp) {
						if(resp.data.status) {
							$scope.state = "Send Email";
							$scope.status = "info";
							$scope.error = "邮件已经发送";
						} else {
							$scope.state = "Send Email";
							$scope.status = "error";
							$scope.error = resp.data.error;
						}
					}, function (reason) {
						$scope.state = "Send Email";
						$scope.status = "error";
						//$scope.error = reason.data;
						$scope.error = "服务器错误，请告知管理员";
					});
				};
			}]
		};
	})
