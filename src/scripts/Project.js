import React from 'react'
import { Layout, Row, Col, Icon } from 'antd'
import styles from '../styles/Project.less'
import classnames from 'classnames'
import ProjectInfo from './ProjectInfo'
import UserPopover from './UserPopover'
import HeaderBar from './HeaderBar'

const { Header, Content, Footer, Sider } = Layout

class Project extends React.Component {
  constructor(props) {
    super(props);
  }

  logOut = () => {
    localStorage.clear()
    this.props.history.push('/')
  }
  
  render() {
    const userinfo = {  // TODO: get from query
      realname: '陆子叶',
      groupNames: [],// TODO: from groupIDs
      joinedYear: 2016,
      enrollmentYear: 2016,
      email: '',
      phone: '',
      projectIDs: []
    }
    return (
      <Layout className={classnames(styles.wrapper, styles.user)}>
        <HeaderBar onlogOut={this.logOut} />
        <Layout className={styles.container}>
          <Sider width={300} className={styles.memberListWrapper}>
            <div className={styles.memberList} >
              <UserPopover
                user={userinfo}
                containerStyle={{
                  width: `${300}px`,
                  padding: `${30}px ${50}px`,
                  marginBottom: `${20}px`,
                  borderRadius: `${7}px`,
                }}
              />
              <UserPopover
                user={userinfo}
                containerStyle={{
                  width: `${300}px`,
                  padding: `${30}px ${50}px`,
                  marginBottom: `${20}px`,
                  borderRadius: `${7}px`,
                }}
              />
              <UserPopover
                user={userinfo}
                containerStyle={{
                  width: `${300}px`,
                  padding: `${30}px ${50}px`,
                  marginBottom: `${20}px`,
                  borderRadius: `${7}px`,
                }}
              />
            </div>
          </Sider>
          <Content className={styles.projectInfoWrapper}>
            <ProjectInfo />
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default Project