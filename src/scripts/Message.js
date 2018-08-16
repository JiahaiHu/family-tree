import React from 'react'

class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

Message.newInstance = function (props, callback) {
  const div = document.createElement('div')
  document.body.appendChild(div);
  let called = false
  function ref(notification) {
    if (called) {
      return
    }
    called = true;
    callback({
      destroy() {
        ReactDOM.unmountComponentAtNode(div);
        div.parentNode.removeChild(div);
      },
    })
  }
  ReactDOM.render(<Message {...props} ref={ref} />, div)
}

export default Message