import React from 'react';
import { Upload, Button } from 'antd'

class Upld extends React.Component {

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
          formData.append('key', dir + `${file.name}`)
          formData.append('policy', policy)
          formData.append('OSSAccessKeyId', accessid)
          formData.append('success_action_status', '200')
          formData.append('callback', callback)
          formData.append('signature', signature)
          formData.append('file', file)

          fetch('https://fmt.hustunique.com', {
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
      <Upload {...props} >
        <Button>上传</Button>
      </Upload>
    )
  }
}

export default Upld;