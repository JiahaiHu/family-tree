import React from 'react'
import styles from '../styles/index.css'
import classnames from 'classnames'
// import Cookies from 'js-cookie'
const MOCK_HOST = 'https://fmt.fredliang.cn'

class IndexFrom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: 'nav',
      enter: true,
    };
  }

  componentDidUpdate() {
    // if (!this.state.enter) {
    //   var that = this
    //   setTimeout(() => {
    //     that.setState({
    //       enter: true,
    //     })
    //   }, 500);
    // }
  }

  myFetch = (cfg) => {
    fetch(cfg.url, {
      method: cfg.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cfg.data),
    })
    .then(res => res.json())
    .then((data) => {
      if (data.code >= 200 && data.code < 300) {
        alert(cfg.successMsg)
      } else {
        alert(data.message)
      }
    })
    .catch((error) => {
      alert("服务器错误，请告知管理员!")
      console.error(error)
    })
  }

  loginClickHandler = () => {
    if (this.state.stage === 'login') {
      let formData = {}
      formData.username = document.getElementById('username').value
      formData.password = document.getElementById('password').value

      let config = {
        url: MOCK_HOST + '/login',
        method: 'POST',
        data: formData,
        successMsg: '登陆成功！',
      }
      this.myFetch(config)
    }
    else {
      // leave
      this.setState({
        enter: false,
      })
      // enter
      var leaveTime = 500 // TODO: different leave time 
      var that = this
      setTimeout(() => {
        that.setState({
          stage: 'login',
          enter: true,
        })
      }, leaveTime);
    }
  }

  registerClickHandler = () => {
    if (this.state.stage === 'register') {
      let formData = {};
      formData.phone = document.getElementById('phone').value;
      formData.username = document.getElementById('username').value;
      formData.password = document.getElementById('password').value;
      formData.verifyCode = document.getElementById('captcha').value;
      
      // TODO: form confirm
      // ...

      // register
      let config = {
        url: MOCK_HOST + '/register',
        method: 'POST',
        data: formData,
        successMsg: '注册成功!',
      }
      this.myFetch(config)
    }
    else {
      // leave
      this.setState({
        enter: false,
      })
      // enter
      var leaveTime = 500
      var that = this
      setTimeout(() => {
        that.setState({
          stage: 'register',
          enter: true,
        })
      }, leaveTime);
    }
  }

  forgetClickHandler = () => {
    // leave
    this.setState({
      enter: false,
    })
    // enter
    var leaveTime = 500
    var that = this
    setTimeout(() => {
      that.setState({
        stage: 'reset',
        enter: true,
      })
    }, leaveTime);
  }

  resetClickHandler = () => {
    let formData = {};
    formData.phone = document.getElementById('phone').value
    formData.password = document.getElementById('password').value
    formData.verifyCode = document.getElementById('captcha').value

    let config = {
      url: MOCK_HOST + '/reset',
      method: 'POST',
      data: formData,
      successMsg: '密码重置成功!',
    }
    this.myFetch(config)
  }

  sendClickHandler = () => {
    let formData = {}
    let config = {}
    formData.username = document.getElementById('username').value
    if (this.state.stage === 'register') {
      formData.password = document.getElementById('password').value
      formData.phone = document.getElementById('phone').value
      config.url = MOCK_HOST + '/register_code'
    } else if (this.state.stage === 'reset') {
      config.url = MOCK_HOST + '/reset_password_code'
    }
    config.method = 'POST'
    config.data = formData
    config.successMsg = '验证码已经发送，请在手机上查看!'
    this.myFetch(config)
  }

  getList = () => {
    if (this.state.stage === 'nav') {
      return null
    } else if (this.state.stage === 'login') {
      return (
        <div className={styles.formList}>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <a className={styles.reset} onClick={this.forgetClickHandler}>Forgot password?</a>
        </div>
      )
    } else if (this.state.stage === 'register') {
      return (
        <div className={styles.formList}>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <label htmlFor={'phone'}>
            <input id={'phone'} placeholder={'phone number'} />
          </label>
          <label htmlFor={'captcha'}>
            <input id={'captcha'} className={styles.captcha} placeholder={'captcha'} />
            <a className={styles.getCaptcha} onClick={this.sendClickHandler}>Send</a>
          </label>
        </div>
      )
    } else if (this.state.stage === 'reset') {
      return (
        <div className={styles.formList}>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <label htmlFor={'captcha'}>
            <input id={'captcha'} className={styles.captcha} placeholder={'captcha'} />
            <a className={styles.getCaptcha} onClick={this.sendClickHandler}>Send</a>
          </label>
        </div>
      )
    }
  }

  render() {
    let header = (
      <div className={classnames({
        [styles.formHeader]: true,
        [styles.center]: this.state.stage === 'nav',
      })}>
        <div className={styles.formTitle}>Family Tree</div>
        <div className={styles.formText}>connect with your teammates</div>
      </div>
    )
    let formWrapperClass = classnames({
      [styles.formWrapper]: true,
      [styles.enter]: this.state.enter,
      [styles.leave]: !this.state.enter,
      [styles.nav]: this.state.stage === 'nav',
      [styles.register]: this.state.stage === 'register',
      [styles.login]: this.state.stage === 'login',
      [styles.reset]: this.state.stage === 'reset',
    })
    let formBarClass = classnames({
      [styles.formBar]: true,
      [styles.gradBgColor]: true,
      [styles.nav]: this.state.stage === 'nav',
    })
    let loginButtonClass = classnames({
      [styles.loginButton]: true,
      [styles.active]: this.state.stage === 'nav' || this.state.stage === 'login',
      [styles.right]: this.state.stage === 'register',
      [styles.left]: this.state.stage === 'login',
    })
    let registerButtonClass = classnames({
      [styles.registerButton]: true,
      [styles.active]: this.state.stage === 'register',
      [styles.right]: this.state.stage === 'login',
    })
    return (
      <div className={formWrapperClass}>
        <div className={formBarClass} />
        <div className={classnames({[styles.enter]: this.state.enter === true})}>
          {header}
          {this.getList()}
        </div>
        { this.state.stage !== 'reset' ?
          (<div className={loginButtonClass} onClick={this.loginClickHandler}>log in</div>) : null }
        { this.state.stage !== 'reset' ?
          (<div className={registerButtonClass} onClick={this.registerClickHandler}>register</div>) : null }
        { this.state.stage === 'reset' ?
          (<div className={classnames(styles.resetButton, styles.active)} onClick={this.resetClickHandler}>reset password</div>) : null }
      </div>
    )
  }
}

export default IndexFrom