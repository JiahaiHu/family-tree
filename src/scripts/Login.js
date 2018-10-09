import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Circles from './Circles';
import CircleWithTag from './CircleWithTag';
import LoginForm from './LoginForm';
import styles from '../styles/Login.css';

class Login extends React.Component {
  render() {
    // redirect to '/home' if token is not expired
    const token = localStorage.getItem('token')
    fetch('https://fmt.fredliang.cn/refresh_token'+'?token='+token, {
      method: 'GET'
    }).then(res => {
      if (res.status == 200) {
        // TODO: update token
        res.json().then((r) => {
          localStorage.setItem('token', r.token)
        })
        this.props.history.push('/home')
      }
    })
    
    return (
      <div className={classnames(styles.wrapper, styles.gradBgColor)}>
        <div className={styles.circlesContainer}>
          <Circles X='70%' Y='20%' R='15%' d='20%' r='20%' deg='200' circleNum='3' />        
          <CircleWithTag x='50%' y='40%' r='40%' deg='160' />
          <CircleWithTag x='65%' y='45%' r='10%' deg='270' />
          <CircleWithTag x='25%' y='65%' r='8%' deg='90' />
        </div>
        <LoginForm />
        {/* <Circles X='35%' Y='80%' R='6%' d='10%' r='20%' /> */}
      </div>
    );
  }
}

export default Login
