import React from 'react';
import { Layout, Row, Col, Icon } from 'antd';
import styles from '../styles/User.less';
import classnames from 'classnames';
const { Header, Content, Footer, Sider } = Layout;

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // ...
    };
  }

  render() {
    return (
      <Layout className={classnames(styles.wrapper, styles.user)}>
        <Header className={styles.headerBar}>
          <span>Family Tree</span>
          <div className={styles.avatar}></div>
        </Header>
      </Layout>
    )
  }
}

export default User