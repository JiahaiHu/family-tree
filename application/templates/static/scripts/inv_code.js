(function($) {
  $.QueryString = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
      var p=a[i].split('=', 2);
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'))
})(jQuery);

var invCodeStatusTable = {
  used: 'used',
  unused: 'unused',
  sent: 'sent',
  unsent: 'unsent',
  all: '*'
};

function InvCodeGen() {
  var total = parseInt($('#inv-code-needs-input').val());
  if (isNaN(total)) {
    var ele = $('#error-show');
    ele.find('.value').html('请输入数字');
    ele.modal('show');
    return;
  }

  $('#inv-code-needs-input').val('');
  $('#gen-btn').prop('disabled', true);
  $.post('/admin/inv_code/create', {total: total}, function (r) {
    if (r.status) {
      var arr = r.message['inv_codes'];
      $('#inv-code-output').text(arr.join(' '));
      $('#gen-btn').prop('disabled', false);
    }
  });
}

var invCode = {
  init: function() {
    var that = this;
    $('#inv-code-type-select').on('change', function () {
      window.location.href = '/admin/manage/inv_code?type=' + $(this).val();
      //that.filter($(this).val());
    });
    $('#t-body').on('click', '.btn-send-inv-code', function () {
      var inv_code = $(this).parent().parent().parent().children()[1].innerText;
      $('#inv-code-to-sent').text(inv_code);
      $('#inv-code-send-panel').modal('show');
    });
    $('#panel-btn-send-inv-code').on('click', function () {
      var inv_code = $('#inv-code-to-sent').text();
      var email = $('#inv-code-email-addr').val().trim();
      if (email.length) {
        var data = {mail_list: [{address: email, inv_code: inv_code}]};
        $.post('/admin/inv_code/send', {info: JSON.stringify(data)}, function (r) {
          if (r.status) {
            window.location.reload();
          }
          else {
            $('#inv-code-send-panel').modal('hide');
            var ele = $('#error-show');
            ele.find('.value').html(r.error);
            ele.modal('show');
          }
        });
      }
    });
    $('#t-body').on('click', '.btn-del-inv-code', function () {
      $(this).prop('disabled', true);
      var inv_code = $(this).parent().parent().parent().children()[1].innerText;
      var data = {inv_codes: [inv_code]};
      $.post('/admin/inv_code/delete', {info: JSON.stringify(data)}, function (r) {
        if (r.status) {
          window.location.reload();
        }
        else {
          var ele = $('#error-show');
          ele.find('.value').html(r.error);
          ele.modal('show');
        }
      })
    });
  },
  filter: function (type) {
    $.post('/admin/inv_code', {type_: invCodeStatusTable[type]}, function (r) {
      if (r.status) {
        var html = '<tr><th>id</th><th>邀请码</th><th>是否使用(is_used)</th><th>是否发送(is_sent)</th><th>已发送邮箱地址</th><th>创建时间</th><th>操作</th></tr>'
        var arr = r.message['inv_codes'];
        for (var i = 0; i < arr.length; i++) {
          html = html + '<tr><td>' + arr[i]['inv_id'] + '</td><td>' + arr[i]['inv_code'] + '</td>'
            + '<td>' + arr[i]['is_used'] + '</td><td>' + arr[i]['is_sent'] + '</td><td>' + arr[i]['to_email'] + '</td>'
            + '<td>' + (new Date(arr[i]['created_time'] * 1000)).toLocaleString() + '</td>'
            + '<td><div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default btn-send-inv-code" title="发送到指定邮箱">发送</button><button type="button" class="btn btn-danger btn-del-inv-code" title="删除该邀请码，已使用的不能删除">删除</button></div></td>'
            + '</tr>';
        }
        $('#t-body').html(html);
      }
      else {
        var ele = $('#error-show');
        ele.find('.value').html(r.error);
        ele.modal('show');
      }
    })
  }
};

$(function () {
  invCode.init();
  var type = $.QueryString['type'] || "all";
  $('#inv-code-type-select').val(type);
  console.log("type " + type);
  invCode.filter(type);
});
