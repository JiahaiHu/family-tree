import React from 'react'
import styles from '../styles/MessageBox.less'

class MessageBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className={styles.MessageBoxContainer}>
        {`${this.props.message.content}`}
      </div>
    )
  }
}

export default MessageBox