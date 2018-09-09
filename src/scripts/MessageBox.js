import React from 'react'
import classnames from 'classnames'
import styles from '../styles/MessageBox.less'

class MessageBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      close: false,
    };
  }

  componentDidUpdate() {
    if (!this.isEmpty(this.props.message)) {
      if (this.timeoutID) {
        clearTimeout(this.timeoutID)
      }
      this.timeoutID = setTimeout(() => {
        this.setState({
          close: true,
        })
      }, 2000)
    }
  }

  isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false
    }
    return true
  }

  getBar() {
    const type = this.props.message.type
    if (type !== 'registering') {
      return (<div className={styles.MessageBoxBar}></div>)
    } else {

    }
  }

  render() {
    const { message } = this.props
    if (this.isEmpty(message)) return null
    let containerClass = classnames({
      [styles.MessageBoxContainer]: true,
      [styles.success]: message.type === 'success',
      [styles.error]: message.type === 'error',
      [styles.leave]: this.state.close,
    })
    return (
      <div className={containerClass}>
        <div className={styles.MessageBoxContent}>
          {`${this.props.message.content}`}
        </div>
        {this.getBar()}
      </div>
    )
  }
}

export default MessageBox