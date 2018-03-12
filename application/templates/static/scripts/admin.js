/**
 * Created by mingtao on 4/16/16.
 */

var admin = {
};

var request = {
  basicFunc: function () {
  }
};

var tagAddPanel = {
  element: $("#tag-add-panel"),
  data: [],
  selectedData: {
    group: null,
    year: null
  },
  show: function () {
    this.element.modal("show");
  },
  hide: function () {
    this.element.modal("hide");
  },
  getGroupInfo: function () {
    var that = this;
    that.element.find('.group').on('change', function () {
      for(var i = 0; i < that.data.length; i++) {
        if(that.data[i].group_name === $(this).val()) {
          that.selectedData.group = that.data[i].group_name;
          that.selectedData.year = that.data[i].start_year;
          var html = '';
          for(var j = that.data[i].start_year; j <= that.data[i].end_year; j++) {
            html += '<option>' + j + '</option>';
          }
          that.element.find('.year').html(html);

          break;
        }
      }
    });

    that.element.find('.year').on('change', function () {
      that.selectedData.year = parseInt($(this).val());
    });

    $.getJSON("/common/info/group", function (data) {
      if(data.status) {
        that.data = data.message.groups;
        var html = '';
        for(var i = 0; i < that.data.length; i++) {
          html += '<option>'+that.data[i].group_name+'</option>'
        }
        that.element.find('.group').html(html);

        var html2 = '';
        for(var j = that.data[0].start_year; j < that.data[0].end_year; j++) {
          html2 += '<option>' + j + '</option>';
        }
        that.element.find('.year').html(html2);

        //set default selected data
        that.selectedData.group = that.data[0].group_name;
        that.selectedData.year = that.data[0].start_year;
      } else {
      }
    });
  }
};

var groupDividePanel = {
  data: {},
  newGroups: [],
  init: function () {
    var that = this;
    $('#group-divide-select').on('change', function () {
      that.setInitUsers($(this).val());
    });
    $('#group-divide-add-divided-btn').on('click', function () {
      var groupName = $('#group-divided-new-name').val().trim();
      if (groupName.length === 0) {
        groupName = $('#group-divided-select').val();
      }
      if (that.newGroups.indexOf(groupName) === -1) {
        that.newGroups.push(groupName);
        var b = document.createElement('b');
        b.textContent = groupName;
        var html = '<div class="group-divided-new-group-item">' +
            '<button type="button" class="btn btn-default btn-sm user-out"><span class="glyphicon glyphicon-chevron-up"></span></button>' +
            '<button type="button" class="btn btn-default btn-sm user-in"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
            '<b>' + b.innerText + '</b><br><div class="group-divided-new-users-radio"></div></div>';
        $('#group-divided-new-group-container').append($(html));
      }
    });
    $('#group-divide-panel').on('click', '.user-in', function (event) {
      var user = $('input[name=group-divide-user]:checked').parent();
      if (user) {
        user.remove();
        $(this).parent().find('.group-divided-new-users-radio').append(user);
      }
    });
    $('#group-divide-panel').on('click', '.user-out', function (event) {
      var user = $(this).parent().find('input[name=group-divide-user]:checked').parent();
      if (user) {
        user.remove();
        $('#group-divide-users').append(user);
      }
    });
  },
  update: function () {
    var deferred = $.Deferred();
    var that = this;
    $.getJSON('/admin/ug', function (r) {
      if (r.status) {
        var eleDivideSelect = $('#group-divide-select');
        var eleDividedSelect = $('#group-divided-select');
        var groups = r.message.groups;
        that.data = {};
        for (var i = 0; i < groups.length; i++) {
          that.data[groups[i]['name']] = groups[i]['members'];
          var html = '<option>' + groups[i]['name'] + '</option>';
          eleDividedSelect.append(html);
          eleDivideSelect.append(html);
        }
        deferred.resolve();
      }
      else {
        deferred.reject(r.error);
      }
    });
    return deferred.promise();
  },
  setInitUsers: function (selected) {
    var that = this;
    var ele = $('#group-divide-users');
    ele.empty();
    var select = $('#group-divide-select');
    if (select.children().length) {
      if (!selected) {
        var defaultName = select.children()[0].value;
        selected = defaultName;
      }
      for (var i = 0; i < that.data[selected].length; i++) {
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'group-divide-user';
        input.value = that.data[selected][i]['id'];
        var span = document.createElement('span');
        $(span).append(input).append(that.data[selected][i]['name']);
        ele.append(span);
      }
    }
    that.newGroups = [];
    $('#group-divided-new-group-container').empty();
  },
  show: function () {
    var that = this;
    $('#group-divide-select').empty();
    $('#group-divided-select').empty();
    $('#group-divide-users').empty();
    $('#group-divided-new-group-container').empty();
    that.update().done(function () {
      that.setInitUsers();
    });
  }
};

/**
 * 成员对象
 * @constructor
 */
var memberTable = {
  members: [],
  element: $('#member-table'),
  init: function () {
    /**
     * delete group tag
     */
    var that = this;
    that.element.on('click', '.group-btn', function () {
      var ele = this;
      var index = parseInt($(ele).attr("data-index"));
      var value = $(ele).html();
      that.members[index].delGroupLabel(value)
        .done(function () {
          $(ele).remove();
        })
        .fail(function (error) {
          var ele = $('#error-show');
          ele.find('.value').html(error);
          ele.modal('show');
        });
    });

    that.element.on('click', '.add-btn', function () {
      var ele = this;
      var index = parseInt($(ele).attr("data-index"));
      that.members[index].addGroupLabel()
        .done(function () {
          var btn = document.createElement('button');
          btn.type = "button";
          btn.className = "btn btn-default group-btn";
          btn.title = "点击删除标签";
          btn.setAttribute('data-index', index + "");
          btn.innerText = tagAddPanel.selectedData.group + "#" + tagAddPanel.selectedData.year;
          ele.parentNode.insertBefore(btn, ele);
        })
        .fail(function (error) {
          var ele = $('#error-show');
          ele.find('.value').html(error);
          ele.modal('show');
        });
      tagAddPanel.getGroupInfo();
    });
  },
  addMember: function (member) {
    member.index = this.members.length;
    this.members.push(member);
  },
  clearMember: function () {
    this.members.length = 0;
  },
  updateView: function () {
    var html = '<tr id="t-label"><th>id</th><th>姓名</th><th>组别</th></tr>';
    for(var i = 0; i < this.members.length; i++) {
      html += this.members[i].constructHtmlString();
    }
    $('#t-label').parent().html(html);
  }
};

function Member(obj) {
  this.id = obj.user_id;
  this.name = obj.username;
  this.avatar = obj.avatar;
  this.groups = obj.groups;
  this.index = null;
}
//删除组别标签
Member.prototype.delGroupLabel = function (value) {
  var deferred = $.Deferred();
  $('#del-tag-confirm').modal('show');
  var that = this;
  window.delTag = function () {
    $.post('/admin/ug/delete', {user_id: that.id, tag: value}, function (data) {
      $('#del-tag-confirm').modal('hide');
      if(data.status) {
        deferred.resolve();
      } else {
        deferred.reject(data.error);
      }
    });
  };
  return deferred.promise();
};
//增加组别标签
Member.prototype.addGroupLabel = function (value) {
  var deferred = $.Deferred();
  tagAddPanel.show();
  var that = this;
  window.addTag = function () {
    var dataToBeSent = tagAddPanel.selectedData;
    $.post('/admin/ug/create', {user_id: that.id, tag: dataToBeSent.group+"#"+dataToBeSent.year}, function (data) {
      tagAddPanel.hide();
      if(data.status) {
        deferred.resolve();
      } else {
        deferred.reject(data.error);
      }
    })
      .fail(function () {
        tagAddPanel.hide();
        deferred.reject("服务器错误");
      });
  };
  return deferred.promise();
};

Member.prototype.constructHtmlString = function () {
  var html = '<tr><td>' + this.id + '</td><td>' + this.name +
    '</td><td><div class="btn-group" role="group">{{btns}}</div></td></tr>';
  var btns = '';
  for(var i = 0; i < this.groups.length; i++) {
    btns += '<button type="button" class="btn btn-default group-btn" title="点击删除该标签" data-index="'+
      this.index +'">' + this.groups[i] + '</button>';
  }
  btns += '<button type="button" class="btn btn-default add-btn" title="点击添加标签" data-index="'+
      this.index +'">添加</button>';
  html = html.replace("\{\{btns}}", btns);

  return html;
};

/**
 * 组别对象
 * @constructor
 */
var Group = function() {
};

Group.groups = [];
Group.init = function () {
  {
    var d = new Date();
    var first = d.getFullYear() - 1;
    if (d.getMonth() > 8) {
      first ++;
    }
    var html = '<option>' + first + '</option>';
    html += '<option>' + (first + 1) + '</option>';
    $('#group-joined-year').html(html);
    $('#group-divided-year').html(html);
  }

  window.addGroup = Group.addGroup;
  window.delGroup = Group.delGroup;
  window.delGroupDialog = function () {
    $('#group-del-panel').modal('show');
    Group.getAll().done(function (arr) {
      var ele = $('#group-del-select');
      ele.html('');
      for (var i = 0; i < arr.length; i++) {
        var option = document.createElement('option');
        option.text = arr[i].group_name;
        ele.append(option);
      }
    }).fail(function (error) {
      var ele = $('#error-show');
      ele.find('.value').html(error);
      ele.modal('show');
    });
  };
  window.joinGroup = Group.joinGroup;
  window.joinGroupDialog = function () {
    $('#group-join-panel').modal('show');
    Group.getAll().done(function (arr) {
      var ele = $('#group-join-checkbox');
      var ele_select = $('#group-joined-select');
      ele.html('');
      ele_select.html('');
      for (var i = 0; i < arr.length; i++) {
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'joinGroupCheckbox';
        input.value = arr[i].group_name;
        ele.append(input).append(input.value).append(document.createElement('br'));
        var option = document.createElement('option');
        option.text = arr[i].group_name;
        ele_select.append(option);
      }
    }).fail(function (error) {
      var ele = $('#error-show');
      ele.find('.value').html(error);
      ele.modal('show');
    })
  };
  window.divideGroup = Group.divideGroup;
  window.divideGroupDialog = function () {
    groupDividePanel.show();
    $('#group-divide-panel').modal('show');
  };

  groupDividePanel.init();
};

Group.getAll = function () {
  var deferred = $.Deferred();
  $.getJSON('/common/info/group?is_exist=1', function (data) {
    if (data.status) {
      deferred.resolve(data.message.groups);
    }
    else {
      deferred.reject(data.error);
    }
  });
  return deferred.promise();
};

Group.updateView = function () {

};

Group.addGroup = function () {
  var groupname = $('#group-add-groupname').val().trim();
  if (groupname.length > 0) {
    $.post('/admin/group/create', {name: groupname}, function (data) {
      $('#group-add-panel').modal('hide');
      if (data.status) {

      }
      else {
        var ele = $('#error-show');
        ele.find('.value').html(error);
        ele.modal('show');
      }
    })
  }
};

Group.delGroup = function () {
  var groupname = $('#group-del-select').val();
  $.post('/admin/group/delete', {name: groupname}, function (data) {
    $('#group-del-panel').modal('hide');
    if (data.status) {

    }
    else {
      var ele = $('#error-show');
      ele.find('.value').html(error);
      ele.modal('show');
    }
  })
};
/**
 * 合并组别
 * @param groups 组别id数组
 */
Group.joinGroup = function () {
  var groups = $('input[name=joinGroupCheckbox]:checked').map(function(){ return this.value; }).toArray();
  var new_group = $('#group-joined-new-name').val().trim();
  if (new_group.length === 0) {
    new_group = $('#group-joined-select').val();
  }
  var year = $('#group-joined-year').val();
  if (groups.length === 0 || new_group.length === 0) {
    var ele = $('#error-show');
    ele.find('.value').html('请将信息填写完整');
    ele.modal('show');
  }
  else {
    $('#group-join-panel').modal('hide');
    var src = {before: groups, after: new_group, year: year};
    $.post('/admin/group/merge', {info: JSON.stringify(src)}, function (data) {
      if (data.status) {

      }
      else {
        var ele = $('#error-show');
        ele.find('.value').html(data.error);
        ele.modal('show');
      }
    });
  }
};

Group.divideGroup = function () {
  var info = {
    before: $('#group-divide-select').val(),
    after: {},
    year: $('#group-divided-year').val()
  };
  var new_groups = $('#group-divided-new-group-container').children();
  var valid = true;
  if ($('#group-divide-users').children().length) {
    valid = false;
  }
  else {
    for (var i = 0; i < new_groups.length; i++) {
      var name = $('b', new_groups[i])[0].innerText;
      var users = $('input', new_groups[i]);
      for (var j = 0; j < users.length; j++) {
        if (info.after[name]) {
          info.after[name].push(users[j].value);
        }
        else {
          info.after[name] = [users[j].value];
        }
      }
      if (!name || users.length === 0) {
        valid = false;
        break;
      }
    }
  }

  $('#group-divide-panel').modal('hide');
  if (!valid) {
    var ele = $('#error-show');
    ele.find('.value').html('存在未分配的用户或新组中为空');
    ele.modal('show');
  }
  else {
    $.post('/admin/group/branch', {info: JSON.stringify(info)}, function (r) {
      if (r.status) {

      }
      else {
        var ele = $('#error-show');
        ele.find('.value').html(r.error);
        ele.modal('show');
      }
    });
  }
};

$(function () {
  window.delTag = function () {};
  window.addTag = function () {};
  window.addGroup = function () {};
  window.delGroup = function () {};
  window.delGroupDialog = function () {};
  window.joinGroup = function () {};
  window.joinGroupDialog = function () {};
  window.divideGroup = function () {};
  window.divideGroupDialog = function () {};
  memberTable.init();
  /**
   * 选择组别
   */
  (function () {
    Group.init();
  })();

  /**
   * 搜索成员
   */
  (function () {
    var timer;
    $('#member-search-input').on('input', function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        $.post("/admin/user/search", {keyword: e.target.value}, function (data) {
          var arr = data.message;
          memberTable.clearMember();
          for(var i = 0; i < arr.length; i++) {
            var member = new Member(arr[i]);
            memberTable.addMember(member);
          }
          memberTable.updateView();
        });
      }, 400);
    });
  })();
});
