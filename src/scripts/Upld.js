import React from 'react';
import { Upload, Button } from 'antd'
const plupload = require('../../lib/plupload-2.3.6/js/plupload.full.min.js')

function up(){

  var accessid = ''
  var accesskey = ''
  var host = ''
  var policyBase64 = ''
  var signature = ''
  var callbackbody = ''
  var filename = ''
  var key = ''
  var expire = 0
  var g_object_name = ''
  var g_object_name_type = ''
  var timestamp = Date.parse(new Date()) / 1000; 
  var now = timestamp

  function send_request(filename) {
      var xmlhttp = null;
      if (window.XMLHttpRequest) {
          xmlhttp=new XMLHttpRequest();
      } else if (window.ActiveXObject) {
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
    
      if (xmlhttp!=null) {
          var serverUrl = `https://fmt.fredliang.cn/files/token?table=user&table_id=200&field=avatar&action=add&file_name=${filename}`
          xmlhttp.open( "GET", serverUrl, false );
          xmlhttp.send( null );
          return xmlhttp.responseText
      } else {
          alert("Your browser does not support XMLHTTP.");
      }
  };

  function get_signature(filename) {
    //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
    now = timestamp = Date.parse(new Date()) / 1000; 
    //if (expire < now + 3)
    //{
      var body = send_request(filename)
      var obj = eval ("(" + body + ")");
      host = obj['host']
      policyBase64 = obj['policy']
      accessid = obj['accessid']
      signature = obj['signature']
      expire = parseInt(obj['expire'])
      callbackbody = obj['callback'] 
      key = obj['dir']
      return true;
    //}
    //return false;
  };

  function set_upload_paramm(up, filename, ret) {
    const param = `table=user&table_id=200&field=avatar&action=add&file_name=${filename}`
    fetch(`https://fmt.fredliang.cn/files/token?${param}`, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(data => {
      // upload to oss
      const { accessid, callback, dir, signature, policy, expire, host } = data
      
      var new_multipart_params = {
        'key' : dir,
        'policy': policy,
        'OSSAccessKeyId': accessid, 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : callback,
        'signature': signature,
      };
    
      up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
      });
    
      up.start();
    })
  }

  function set_upload_param(up, filename, ret) {
    //if (ret == false) {
      ret = get_signature(filename)
    //}
    g_object_name = key;
    var new_multipart_params = {
      'key' : g_object_name,
      'policy': policyBase64,
      'OSSAccessKeyId': accessid, 
      'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
      'callback' : callbackbody,
      'signature': signature,
    };

    up.setOption({
      'url': host,
      'multipart_params': new_multipart_params
    });
    console.log('?')
    up.start();
  }

  var uploader = new plupload.Uploader({
    runtimes : 'html5,flash,silverlight,html4',
    browse_button : 'selectfiles', 
    // multi_selection: false,
    container: document.getElementById('container'),
    flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
    silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'https://fmt.hustunique.com',

    filters: {
      mime_types : [ //只允许上传图片和zip文件
      { title : "Image files", extensions : "jpg,gif,png,bmp" }, 
      { title : "Zip files", extensions : "zip,rar" }
      ],
      max_file_size : '10mb', //最大只能上传10mb的文件
      prevent_duplicates : true //不允许选取重复文件
    },

    init: {
      PostInit: function() {
        document.getElementById('ossfile').innerHTML = '';
        document.getElementById('postfiles').onclick = function() {
          set_upload_param(uploader, '', false);
          return false;
        };
      },

      FilesAdded: function(up, files) {
        plupload.each(files, function(file) {
          document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
          +'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
          +'</div>';
        });
      },

      BeforeUpload: function(up, file) {
        set_upload_param(up, file.name, true);
      },

      UploadProgress: function(up, file) {
        var d = document.getElementById(file.id);
        d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
              var prog = d.getElementsByTagName('div')[0];
        var progBar = prog.getElementsByTagName('div')[0]
        progBar.style.width= 2*file.percent+'px';
        progBar.setAttribute('aria-valuenow', file.percent);
      },

      FileUploaded: function(up, file, info) {
        if (info.status == 200) {
            document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'upload to oss success, object name:' + get_uploaded_object_name(file.name) + ' 回调服务器返回的内容是:' + info.response;
        } else if (info.status == 203) {
            document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' + info.response;
        } else {
            document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
        } 
      },

      Error: function(up, err) {
        if (err.code == -600) {
            document.getElementById('console').appendChild(document.createTextNode("\n选择的文件太大了,可以根据应用情况，在upload.js 设置一下上传的最大大小"));
        } else if (err.code == -601) {
            document.getElementById('console').appendChild(document.createTextNode("\n选择的文件后缀不对,可以根据应用情况，在upload.js进行设置可允许的上传文件类型"));
        } else if (err.code == -602) {
            document.getElementById('console').appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
        } else {
            document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
        }
      }
    }
  });
  uploader.init()
}

class Upld extends React.Component {

  componentDidMount() {
    up()
  }

  render() {
    const props = {
      action: 'https://fmt.fredliang.cn/files',
      beforeUpload: (file) => {
        // TODO: limit file size or type

        // get policy and signature
        const param = 'table=user&table_id=1&field=avatar&action=add'
        fetch(`https://fmt.fredliang.cn/files/token?${param}`, {
          method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
          // upload to oss
          const { accessid, callback, dir, signature, policy, expire, host } = data
          const formData = new FormData()

          formData.append('name', file.name)
          formData.append('key', dir)
          formData.append('policy', policy)
          formData.append('OSSAccessKeyId', accessid)
          formData.append('success_action_status', '200')
          formData.append('callback', callback)
          formData.append('signature', signature)
          formData.append('file', file)

          // 'https://fmt.hustunique.com'
          fetch(host, {
            method: 'POST',
            headers: {
              "Content-Type": "multipart/form-data",
            },
            body: formData
          }).then()
        })

        return false  // cancel uploading
      },
    }
    return (
      <div>
        <Upload {...props} >
          <Button>上传</Button>
        </Upload>
        <div id="ossfile"></div>
        <div id="container">
          <div id="selectfiles">select</div>
          <div id="postfiles">upload</div>
        </div>
        <pre id="console"></pre>
      </div>
    )
  }
}

export default Upld;