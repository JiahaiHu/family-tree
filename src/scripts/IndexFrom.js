import React from 'react';
import styles from '../styles/index.css';
import classnames from 'classnames';
// import Cookies from 'js-cookie';
const MOCK_HOST = 'https://fmt.fredliang.cn';

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


  loginClickHandler = () => {
    if (this.state.stage === 'login') {
      // get formData
      let formData = {};
      formData.username = document.getElementById('username').value;
      formData.password = document.getElementById('password').value;

      fetch(MOCK_HOST + '/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      .then(res => res.json())
      .then((data) => {
        if (data.code === 200) {
          alert("success!");
          // Cookies.set('Id', data.message.user_id);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        alert("服务器错误，请告知管理员!");
        console.error(error);
      })
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
      formData.re_password = document.getElementById('re_password').value;
      formData.inviteCode = document.getElementById('inviteCode').value;
      
      // form confirm
      // ...
      // confirm password
      if(formData.password !== formData.re_password) {
        // error
        alert("Password confirm failed!");
        return;
      }
      // register
      fetch(MOCK_HOST + '/register', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      .then(res => res.json())
      .then((data) => {
        if (data.code === 200) {
          // switch (data.state) {
          //   case 0:
          //     alert("注册成功，登录中!");
          //     break;
          //   case 1:
          //     alert("注册邮件已发送, 未收到可再次发送!");
          //     break;
          //   case 2:
          //     alert("注册邮件发送失败, 点击手动发送!");
          //     break;
          // }
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        alert("服务器错误，请告知管理员!");
        console.log(error);
      })
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
    formData.phone = document.getElementById('phone').value;
    fetch(MOCK_HOST + '/forgot', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
    .then(res => res.json())
    .then((data) => {
      if (data.code === 200) {
        alert("邮件已经发送!");        
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      alert("服务器错误，请告知管理员!");
      console.log(error);
    })
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
          <label htmlFor={'phone'}>
            <input id={'phone'} placeholder={'phone number'} />
          </label>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <label htmlFor={'re_password'}>
            <input id={'re_password'} placeholder={'confirm password'} type={'password'} />
          </label>
          <label htmlFor={'inviteCode'}>
            <input id={'inviteCode'} placeholder={'captcha'} />
            <a className={styles.getCode}>Send a captcha</a>
          </label>
        </div>
      )
    } else if (this.state.stage == 'reset') {
      return (
        <div className={styles.formList}>
          <label htmlFor={'phone'}>
            <input id={'phone'} placeholder={'phone number'} />
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