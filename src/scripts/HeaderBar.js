import React from 'react'
import classnames from 'classnames';
import { Layout, Dropdown } from 'antd'
import styles from '../styles/HeaderBar.less'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import defaultAvatar from '../assets/avatar.png'

const { Header } = Layout

class HeaderBar extends React.Component {
  constructor(props) {
    super(props)
  }

  getAvatar = () => {
    const username = localStorage.getItem('username')
    const GET_AVATAR_URL = gql`
    {
      user(username: "${username}") {
        avatar
      }
    }
    `
    return (
      <Query query={GET_AVATAR_URL}>
        {({ loading, error, data }) => {
          if (loading) return ''
          if (error) {
            console.log(error)
            return ''
          }

          const avatarUrl = data.user[0].avatar || defaultAvatar
          return <img width={40} src={avatarUrl} />
        }}
      </Query>
    )
  }

  render() {
    const userMenu = (
      <div className={styles.userMenu}>
        <a href="/user">Profile</a>
        <a href="/company">Company</a>
        <a onClick={this.props.onlogOut}>Log out</a>
      </div>
    )
    const cls = classnames({
      [styles.headerBar]: true,
      [styles.hasBar]: this.props.hasBar || false,
      [styles.hasShadow]: this.props.hasShadow || false,
    })

    return (
      <Header className={cls} >
        <span>Family Tree</span>
        <Dropdown overlay={userMenu} trigger={['click']} >
          <div className={styles.avatar} >{this.getAvatar()}</div>
        </Dropdown>
      </Header>
    )
  }
}

export default HeaderBar;