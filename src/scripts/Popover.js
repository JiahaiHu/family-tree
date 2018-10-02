import React, { Component } from 'react'
import styles from '../styles/Popover.less'

class Popover extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  onMouseEnter = (e) => {
    const delay = 500
    this.clearDelayTimer()
    this.delayTimer = setTimeout(() => {
      this.setState({visible: true})
      this.clearDelayTimer()
    }, delay);
  }

  onMouseLeave = (e) => {
    this.setState({visible: false})
    this.clearDelayTimer()
  }

  clearDelayTimer() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  getPopover() {
    if (!this.state.visible) return null

    return (
      <div className={styles.content}>{this.props.content}</div>
    )
  }

  render() {
    const { children } = this.props
    const triggerProps = {}

    triggerProps.onMouseEnter = this.onMouseEnter
    triggerProps.onMouseLeave = this.onMouseLeave

    return (
      <div className={styles.container} {...triggerProps} >
        {children}
        {this.getPopover()}
      </div>
    )
  }
}

export default Popover