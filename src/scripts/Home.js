import React from 'react';
import { Layout, Checkbox, Row, Col, Icon } from 'antd';
import styles from '../styles/Home.less';
import classnames from 'classnames';
const { Header, Content, Footer, Sider } = Layout

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      checkedGroups: [],
      checkedYears: [],
      checkedGenders: [],
    };
  }

  leftHandler = () => {
    this.setState({
      collapsed: true,
    });
  }

  rightHandler = () => {
    this.setState({
      collapsed: false,
    });
  }

  groupCheckHandler = (checkedValue) => {
    this.setState({
      checkedGroups: checkedValue,
    })
  }

  yearCheckHandler = (checkedValue) => {
    this.setState({
      checkedYears: checkedValue,
    })
  }

  genderCheckHandler = (checkedValue) => {
    this.setState({
      checkedGenders: checkedValue,
    })
  }

  render() {
    const collapsedWidth = 160;
    return (
      <Layout className={classnames(styles.wrapper, styles.home)}>
        <Header className={styles.homeHeader}>
          Family Tree
        </Header>
        <Layout>
          <Sider
            theme={'light'}
            className={styles.filter}
            width={collapsedWidth * 2}
            collapsible
            collapsed={this.state.collapsed}
            collapsedWidth={collapsedWidth}
            trigger={null}
          >
            <div className={styles.filterHeader}>
              <span>Group</span>
              <div className={styles.trigger}>
                <Icon type="left" onClick={this.leftHandler} style={{ opacity: this.state.collapsed ? 0.2 : 0.8 }} />
                <Icon type="right" onClick={this.rightHandler} style={{ opacity: this.state.collapsed ? 0.8 : 0.2 }} />
              </div>
            </div>
            <div className={styles.filterContent}>
              <div>
                <Checkbox.Group onChange={this.groupCheckHandler}>
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
              </div>
              <div className={styles.extendedFilter}>
                <div>
                  Generation Year
                </div>
                <Checkbox.Group onChange={this.yearCheckHandler}>
                  <Row>
                    <Checkbox value="2011">2011</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2012">2012</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2013">2013</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2014">2014</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2015">2015</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2016">2016</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2017">2017</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="2018">2018</Checkbox>
                  </Row>
                </Checkbox.Group>
                <div>
                  Gender
                </div>
                <Checkbox.Group onChange={this.genderCheckHandler}>
                  <Row>
                    <Checkbox value="Male">Male</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="Female">Female</Checkbox>
                  </Row>
                </Checkbox.Group>
              </div>
            </div>
          </Sider>
          <Content>main content</Content>
          <Sider>right sidebar</Sider>
        </Layout>
      </Layout>
    )
  }
}

export default Home
