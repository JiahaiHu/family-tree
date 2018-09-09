import React from 'react'
import classnames from 'classnames'
import styles from '../styles/MessageBox.less'

class MessageBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getBar() {
    const type = this.props.message.type
    if (type !== 'registering') {
      return (<div className={styles.MessageBoxBar}></div>)
    } else {

    }
  }

  render() {
    const type = this.props.message.type
    let containerClass = classnames({
      [styles.MessageBoxContainer]: true,
      [styles.success]: type === 'success',
      [styles.error]: type === 'error',
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