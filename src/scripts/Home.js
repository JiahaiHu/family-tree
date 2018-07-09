import React from 'react';
import { Layout, Checkbox, Row, Col } from 'antd';
import styles from '../styles/Home.less';
import classnames from 'classnames';
const { Header, Content, Footer, Sider } = Layout

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  render() {
    return (
      <Layout className={classnames(styles.wrapper, styles.home)}>
        <Header>
          Family Tree
        </Header>
        <Layout>
          <Sider theme={'light'} collapsible={true} collapsedWidth={100}>
            <header>
              Group
            </header>
            <Row>
              <Col span={12}>
                <Checkbox.Group>
                  <Row>
                    <Checkbox value="Android" className={styles.Android}>Android</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="AILab" className={styles.AILab}>AI Lab</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Design" className={styles.Design}>Design</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Game" className={styles.Game}>Game</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="iOS" className={styles.iOS}>iOS</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Lab" className={styles.Lab}>Lab</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="PM" className={styles.PM}>PM</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Web" className={styles.Web}>Web</Checkbox>
                  </Row>
                </Checkbox.Group>
              </Col>
              <Col span={12}>
                <header>
                  Generation Year
                </header>
                <Checkbox.Group>
                  <Row>
                    <Checkbox value="Male">Male</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Female">Female</Checkbox>
                  </Row>
                </Checkbox.Group>
              </Col>
            </Row>
          </Sider>
          <Content>main content</Content>
          <Sider>right sidebar</Sider>
        </Layout>
      </Layout>
    )
  }
}

export default Home
