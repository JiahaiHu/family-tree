/**
 * Created by mingtao on 16-3-12.
 */

angular.module('ajax', [])
  .factory("img2base64", [function() {
    /**
     * img 为文件
     */
    return function (img, callback) {
      /*
      var dataUrl = window.URL.createObjectURL(img);
      var img2 = document.createElement('img');
      img2.src = dataUrl;
      console.log(img2);
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      canvas.height = img2.height;
      canvas.width = img2.width;
      ctx.drawImage(img2, 0, 0);
      return canvas.toDataURL("base64Img");
      */
      var image = "";
      var reader = new FileReader();
      reader.onload = function(evt){
        image = evt.target.result;
        callback(image);
      };
      reader.readAsDataURL(img);
    };
  }])
  .factory('myHttp', ["$http", '$q', function($http, $q) {
    return function (cfg, data, callback) {
      var d = $q.defer();
      var config = {
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        }
      };
      config.data = data;
      for(var i in cfg) {
        config[i] = cfg[i];
      }
      $http(config).then(
        function(resp) {
          d.resolve(resp);
        },
        function (reason) {
          d.reject(reason)
        }
      );
      return d.promise;
    }
  }])
  .factory('common', ['myHttp', '$q', function (myHttp, $q) {
    return {
      search: function (data) {
        var deferred = $q.defer();
        myHttp({
          method: "POST",
          url: "/common/search/member"
        }, data)
          .then(
            function(resp) {
              deferred.resolve(resp);
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
        return deferred.promise;
      },
      group: function (data) {
        var deferred = $q.defer();
        myHttp({
          method: "GET",
          url: "/common/info/group"
        }, data)
          .then(
            function(resp) {
              deferred.resolve(resp);
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
        return deferred.promise;
      }
    }
  }])
  .factory('account', ['myHttp', '$q',function(myHttp, $q) {
    return {
      register: function(data) {
        var deferred = $q.defer();
        myHttp({
            method: "POST",
            url: "/account/register"
          }, data)
          .then(
            function(resp) {
              deferred.resolve(resp);
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
        return deferred.promise;
      },
      login: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/account/login"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
			forget: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/account/forgot"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
			reset: function(token, data) {
				var deferred = $q.defer();
				myHttp(
					{
						method: "POST",
						url: "/account/reset/" + token
					},
					data)
					.then(function(resp) {
						deferred.resolve(resp);
					}, function(reason) {
						deferred.reject(reason);
					});
        return deferred.promise;
			},
      logout: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "GET",
            url: "/account/logout"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      basicInfo: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/account/fillin/step1"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      step2: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/account/fillin/step2"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
			validate: function(data) {
				var deferred = $q.defer();
				myHttp(
					{
						method: "POST",
						url: "/account/email/validate"
					},
					data)
					.then(function(resp) {
						deferred.resolve(resp);
					}, function(reason) {
						deferred.reject(reason);
					});
				return deferred.promise;
			}
    }
  }])
  .factory('render_api', ['myHttp', '$q', function(myHttp, $q) {
    return {
      homepage: function(data) {
        var deferred = $q.defer();
        var user_id;
        if(data.user_id) {
          user_id = "?user_id=" + data.user_id;
        } else {
          user_id = "";
        }
        myHttp(
          {
            method: "GET",
            url: "/render/homepage" + user_id
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      timeline: function (data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "GET",
            url: "/render/timeline"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      }
    }
  }])
  .factory('settings_api', ['myHttp', '$q', function(myHttp, $q) {
    return {
      personal: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/settings/m/personal"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      group: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "GET",
            url: "/settings/m/group"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      avatar: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/settings/m/personal/avatar"
          },
          data)
          .then(function(resp) {
            deferred.resolve(resp);
          }, function(reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      mentor: function(data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/settings/m/mentor"
          },
          data)
          .then(function (resp) {
            deferred.resolve(resp);
          }, function (reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      passwd: function (data) {
        var deferred = $q.defer();
        myHttp(
          {
            method: "POST",
            url: "/settings/m/passwd"
          },
          data)
          .then(function (resp) {
            deferred.resolve(resp);
          }, function (reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      },
      project: {
        create: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program/create"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        },
        update: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        },
        updateMember: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program/member/update"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        },
        del: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program/delete"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        },
        devolve: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program/devolve"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        },
        exit: function (data) {
          var deferred = $q.defer();
          myHttp(
            {
              method: "POST",
              url: "/settings/m/program/member/exit"
            },
            data)
            .then(function (resp) {
              deferred.resolve(resp);
            }, function (reason) {
              deferred.reject(reason);
            });
          return deferred.promise;
        }
      }
    }
  }])
  .service('group', function() {

  })
  .service('program', function() {
  })
