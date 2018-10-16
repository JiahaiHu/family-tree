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
          const formData = new FormData()
          if (data) {
            Object.keys(data).map(key => {
              formData.append(key, data[key])
            })
          }
          
          formData.append(file.filename, file)
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
      customRequest: ({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials,
      }) => {
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