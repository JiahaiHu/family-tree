import React from 'react'
import { Layout, Row, Col, Icon } from 'antd'
import styles from '../styles/User.less'
import classnames from 'classnames'
import UserCard from './UserCard'
import ProjectCard from './ProjectCard'
import HeaderBar from './HeaderBar'

const { Header, Content, Footer, Sider } = Layout

class User extends React.Component {
  constructor(props) {
    super(props);
  }

  logOut = () => {
    localStorage.clear()
    this.props.history.push('/')
  }
  
  render() {
    const userinfo = {  // TODO: get from query
      group : 'Design',
      abilities : 'UI/UX',
      tel : '180-0000-0000',
      email : 'lzybiasia@gmail.com',
      location : 'JiuJiang, Jiangxi',
      wechat : 'Biasia',
      mentor : 'Xie Yubin',
      mentee : 'Yan Lei',
      company: 'Tencent',
    }
    return (
      <Layout className={classnames(styles.wrapper, styles.user)}>
        <HeaderBar onlogOut={this.logOut} />        
        <Content className={styles.container}>
          <div className={styles.userCardWrapper}>
            <UserCard userinfo={userinfo} />
          </div>
          <div className={styles.projectsWrapper}>
            <ProjectCard index={1} />
            <ProjectCard index={2} />
          </div>
        </Content>
      </Layout>
    )
  }
}

export default User