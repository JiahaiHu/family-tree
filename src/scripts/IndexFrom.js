import React from 'react';
import styles from '../styles/index.css';
import classnames from 'classnames';
// import Cookies from 'js-cookie';

class IndexFrom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pre: 'nav',
      next: 'nav',
      enter: true,
    };
  }

  componentDidUpdate() {
    if (!this.state.enter) {
      var that = this
      setTimeout(() => {
        that.setState({
          enter: true,
        })
      }, 500);
    }
  }

  transformRequest = (obj) => {
    let str = [];
    for (let p in obj) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&");
  }

  loginClickHandler = () => {
    if (this.state.next == 'nav') {
      this.setState({
        pre: 'nav',
        next: 'login',
        enter: false,
      })
    }
    else if (this.state.next == 'login') {  // login
      // get formData
      let formData = {};
      formData.email = document.getElementById('username').value;
      formData.password = document.getElementById('password').value;

      fetch('/account/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: this.transformRequest(formData),
      })
      .then(res => res.json())
      .then((data) => {
        // console.log(data);
        if (data.status) {
          // Cookies.set('Id', data.message.user_id);
        } else {
          console.log(data.error);
        }
      })
      .catch((error) => {
        alert("服务器错误，请告知管理员!");
        console.log(error);
      })
    }
  }

  registerClickHandler = () => {
    if (this.state.next == 'nav') {
      this.setState({
        pre: 'nav',
        next: 'register',
        enter: false,
      })
    }
    else if (this.state.next == 'register') {
      let formData = {};
      formData.email = document.getElementById('email').value;
      formData.username = document.getElementById('username').value;
      formData.password = document.getElementById('password').value;
      formData.re_password = document.getElementById('confirm').value;
      formData.inv_code = document.getElementById('invite').value;

      // confirm password
      if(formData.password !== formData.re_password) {
        // error
        alert("Password confirm failed!");
        return;
      }
      // register
      fetch('/account/register', {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: this.transformRequest(formData),
      })
      .then(res => res.json())
      .then((data) => {
        if (data.status) {
          switch (data.state) {
            case 0: // success
              alert("注册成功，登录中!");
              // todo: login...
              break;
            case 1:
              alert("注册邮件已发送, 未收到可再次发送!");
              break;
            case 2:
              alert("注册邮件发送失败, 点击手动发送!");
              break;
          }
        } else {
          alert("服务器错误，请告知管理员!");
          console.log(data.error);
        }
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }

  forgetClickHandler = () => {
    this.setState({
      pre: this.state.next,
      next: 'forget',
      enter: false,
    })
  }

  resetClickHandler = () => {
    let formData = {};
    formData.email = document.getElementById('email').value;
    fetch('/account/forgot', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: this.transformRequest(formData),
    })
    .then(res => res.json())
    .then((data) => {
      if (data.status) {
        alert("邮件已经发送!");        
      } else {
        console.log(data.error);
      }
    })
    .catch((error) => {
      alert("服务器错误，请告知管理员!");
      console.log(error);
    })
  }

  getList = () => {
    if (this.state.next == 'nav') {
      return null
    } else if (this.state.next == 'login' && this.state.enter || this.state.next == 'forget' && !this.state.enter) {
      return (
        <div className={styles.formList}>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <a className={styles.forget} onClick={this.forgetClickHandler}>Forgot password?</a>
        </div>
      )
    } else if (this.state.next == 'register' && this.state.enter) {
      return (
        <div className={styles.formList}>
          <label htmlFor={'email'}>
            <input id={'email'} placeholder={'email'} />
          </label>
          <label htmlFor={'username'}>
            <input id={'username'} placeholder={'username'} />
          </label>
          <label htmlFor={'password'}>
            <input id={'password'} placeholder={'password'} type={'password'} />
          </label>
          <label htmlFor={'confirm'}>
            <input id={'confirm'} placeholder={'confirm password'} type={'password'} />
          </label>
          <label htmlFor={'invite'}>
            <input id={'invite'} placeholder={'invite code'} />
            <a className={styles.getCode}>How to get?</a>
          </label>
        </div>
      )
    } else if (this.state.next == 'forget' && this.state.enter) {
      return (
        <div className={styles.formList}>
          <label htmlFor={'email'}>
            <input id={'email'} placeholder={'email'} />
          </label>
        </div>
      )
    }
  }

  render() {
    let header = (
      <div className={classnames({
        [styles.formHeader]: true,
        [styles.center]: this.state.next == 'nav' || this.state.pre == 'nav' && !this.state.enter,
      })}>
        <div className={styles.formTitle}>Family Tree</div>
        <div className={styles.formText}>connect with your teammates</div>
      </div>
    )
    let formWrapperClass = classnames({
      [styles.formWrapper]: true,  
      [styles.enter]: this.state.enter,
      [styles.leave]: !this.state.enter,
      [styles.nav]: this.state.next == 'nav',
      [styles.register]: this.state.next == 'register',
      [styles.login]: this.state.next == 'login',
      [styles.forget]: this.state.next == 'forget',
    })
    let formBarClass = classnames({
      [styles.formBar]: true,
      [styles.gradBgColor]: true,
      [styles.nav]: this.state.next == 'nav' ||
        this.state.pre == 'nav' && !this.state.enter, // Leaving
    })
    let loginButtonClass = classnames({
      [styles.loginButton]: true,
      [styles.active]: this.state.next != 'register' || !this.state.enter,
      [styles.nav]: this.state.next == 'nav' ||
      this.state.pre == 'nav' && !this.state.enter,
      [styles.right]: this.state.next == 'register' && this.state.enter,
    })
    let registerButtonClass = classnames({
      [styles.registerButton]: true,
      [styles.active]: this.state.next == 'register' && this.state.enter,
      [styles.nav]: this.state.next == 'nav' ||
      this.state.pre == 'nav' && !this.state.enter,
    })
    return (
      <div className={formWrapperClass}>
        <div className={formBarClass} />
        <div className={classnames({[styles.enter]: this.state.enter == true})}>
          {header}
          {this.getList()}
        </div>
        { this.state.next == 'nav' || this.state.next == 'login' || this.state.next == 'register' || this.state.next =='forget' && !this.state.enter ?
          (<div className={loginButtonClass} onClick={this.loginClickHandler}>log in</div>) : null }
        { this.state.pre == 'nav' && (this.state.next != 'login' || !this.state.enter) ||
        this.state.next == 'register' && this.state.enter ?
          (<div className={registerButtonClass} onClick={this.registerClickHandler}>register</div>) : null }
        { this.state.next == 'forget' && this.state.enter ?
          (<div className={classnames(styles.resetButton, styles.active)} onClick={this.resetClickHandler}>reset password</div>) : null }
      </div>
    )
  }
}

export default IndexFrom