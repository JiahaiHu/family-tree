import React from 'react'
import { Layout, Row, Col, Icon } from 'antd'
import styles from '../styles/User.less'
import classnames from 'classnames'
import UserCard from './UserCard'
import ProjectCard from './ProjectCard'

const { Header, Content, Footer, Sider } = Layout

class User extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const userinfo = {  // Todo: get from props
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
        <Header className={styles.headerBar}>
          <span>Family Tree</span>
          <div className={styles.avatar}></div>
        </Header>
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