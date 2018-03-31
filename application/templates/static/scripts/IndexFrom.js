import React from 'react';
import styles from '../styles/index.css';
import classnames from 'classnames';

class IndexFrom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'nav',
      enter: true,
    };
  }

  componentDidUpdate() {
    if (this.state.state != 'nav' && !this.state.enter) {
      var that = this
      setTimeout(() => {
        that.setState({
          enter: true,
        })
      }, 500);
    }
  }

  getList = () => {
    if (this.state.state == 'nav') {
      return null
    } else if (this.state.state == 'login' && this.state.enter) {
      return (
        <div className={styles.formList}>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} />
          </label>
          <a>Forgot password?</a>
        </div>
      )
    } else if (this.state.state == 'register') {
      //
    }
  }

  render() {
    let header, list;
    
    header = (
      <div className={classnames({
        [styles.formHeader]: true,
        [styles.center]: true,
      })}>
        <div className={styles.formTitle}>Family Tree</div>
        <div className={styles.formText}>connect with your teammates</div>
      </div>
    )
    if (this.state.state != 'nav' && this.state.enter) {
      header = (
        <div className={styles.formHeader}>
          <div className={styles.formTitle}>Family Tree</div>
          <div className={styles.formText}>connect with your teammates</div>
        </div>
      )
    }
    
    return (
      <div className={classnames({
        [styles.formWrapper]: true,
        [styles.enter]: this.state.state == 'nav',
        [styles.leave]: !this.state.enter,
      })}>
        <div className={classnames({
          [styles.formBar]: true,
          [styles.gradBgColor]: true,
          [styles.first]: this.state.state == 'nav'})} />        
        <div className={classnames({
          [styles.enter]: this.state.state == 'enter',
        })}>
          {header}
          {this.getList()}
        </div>
          <div
            className={classnames({
              [styles.loginButton]: true,
              [styles.active]: true,
              [styles.first]: this.state.state == 'nav',
            })}
            onClick={() => this.setState({
              state: 'login',
              enter: false,
              })}>
            log in
          </div>
          { this.state.state == 'login' && this.state.enter ? null :
            (<div className={styles.registerButton}>register</div>) }
        
      </div>
    )
  }
}

export default IndexFrom