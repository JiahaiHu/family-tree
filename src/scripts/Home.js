import React from 'react'
import { Layout, Checkbox, Radio, Row, Col, Icon } from 'antd'
import styles from '../styles/Home.less'
import classnames from 'classnames'
import Picker from './Picker'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const { Header, Content, Footer, Sider } = Layout

const GET_USERS = gql`
  {
    user {
      id
      realname
      mentorIDs
      menteeIDs
      groupIDs
      # for user popover
      phone
      email
      projectIDs
    }
  }
`

// test
const users = (
  <Query query={GET_USERS}>
    {({ loading, error, data }) => {
      if (loading) return 'loading...'
      if (error) {
        console.log(error)
        return 'Error!'
      }

      console.log(data)
      return 'Get!'
    }

    }
  </Query>
)


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      checkedGroups: [],
      checkedYears: [],
      checkedGenders: [],
      focusedYear: 2017,
      // minVisibleIndex: [], // for line's visibility
    };
  }

  getTimeLine() {
    return (
      <div className={styles.timeline}>
        <ul>
          <li style={{ left: '30px' }}>...<span></span></li>
          <li style={{ left: '20%' }}>2016<span></span></li>
          <li style={{ left: '60%' }}>2017<span></span></li>
          <li style={{ left: '100%' }}>2018<span></span></li>
        </ul>
      </div>
    )
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

  mainYearCheckHandler = (e) => {
    this.setState({
      focusedYear: e.target.value,
    })
  }

  selectedYear = null;

  onclick = (userId) => {
    this.setState({
      selectedUserId: userId,
    });
    this.selectedYear = 2017;
  }

  render() {
    const collapsedWidth = 160;
    // Todo: filter and sort data
    const db = {
      2017: [
        {
          name: '赵某某',
          group: 'AILab',
        },
        {
          name: '钱某某',
          group: 'Android',
        },
        {
          name: '孙某某',
          group: 'Design',
        },
        {
          name: '李某某',
          group: 'Game',
        },
        {
          name: '周某某',
          group: 'iOS',
        },
        {
          name: '吴某某',
          group: 'Lab',
        },
        {
          name: '郑某某',
          group: 'PM',
        },
        {
          name: '王某某',
          group: 'Web',
        },
        {
          name: '赵某某',
          group: 'Design',
        },
        {
          name: '钱某某',
          group: 'Game',
        },
        {
          name: '孙某某',
          group: 'AILab',
        },
        {
          name: '李某某',
          group: 'PM',
        },
        {
          name: '周某某',
          group: 'Web',
        },
        {
          name: '吴某某',
          group: 'Design',
        },
        {
          name: '郑某某',
          group: 'Web',
        },
        {
          name: '王某某',
          group: 'AILab',
        },
      ],
    };
    const focusedIndex = {};
    focusedIndex[2017] = this.state.selectedUserId; // to fix
    const selectedYear = this.selectedYear;
    return (
      <Layout className={classnames(styles.wrapper, styles.home)} >
        <Header className={styles.homeHeader} >
          <span>Family Tree</span>
          <div className={styles.avatar}></div>
        </Header>
        <Layout style={{ backgroundColor: '#fff' }} >
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
              <span className={styles.checkGroupHeader}>Group</span>
              <div className={styles.trigger} style={{ paddingRight: this.state.collapsed ? 0 : 20 }}>
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
                <div className={styles.checkGroupHeader}>
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
                <div className={styles.checkGroupHeader}>
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
          <Content className={styles.homeContent} >
            <div className={styles.timelineContainer} >
              {this.getTimeLine()}
            </div>
            <div className={styles.homeContentCol} style={{ left: '18%' }} >
              <Picker
                year={2017}
                items={db[2017]}
                selected={selectedYear === 2017}
                focusedIndex={focusedIndex[2017]}
                onclick={this.onclick}
              />
            </div>
            <div className={styles.homeContentCol} style={{ left: '36%', width: 'calc(36% - 166px)' }} >
              {users}
            </div>
            <div className={styles.homeContentCol} style={{ left: '54%' }} >
              <Picker
                year={2017}
                items={db[2017]}
                selected={selectedYear === 2017}
                focusedIndex={focusedIndex[2017]}
                onclick={this.onclick}
              />
            </div>
            <div className={styles.homeContentCol} style={{ left: '72%', width: 'calc(36% - 166px)' }} >
              match line
            </div>
            <div className={styles.homeContentCol} style={{ left: '90%' }} >
              <Picker
                year={2017}
                items={db[2017]}
                selected={selectedYear === 2017}
                focusedIndex={focusedIndex[2017]}
                onclick={this.onclick}
              />
            </div>
          </Content>
          <Sider className={styles.rightSider} width={160}>
            <Radio.Group onChange={this.mainYearCheckHandler}>
              <Row>
                <Radio value="2018">2018</Radio>
              </Row>
              <Row>
                <Radio value="2017">2017</Radio>
              </Row>
              <Row>
                <Radio value="2016">2016</Radio>
              </Row>
              <Row>
                <Radio value="2015">2015</Radio>
              </Row>
              <Row>
                <Radio value="2014">2014</Radio>
              </Row>
              <Row>
                <Radio value="2013">2013</Radio>
              </Row>
              <Row>
                <Radio value="2012">2012</Radio>
              </Row>
              <Row>
                <Radio value="2011">2011</Radio>
              </Row>
              <Row>
                <Radio value="2010">2010</Radio>
              </Row>
              <Row>
                <Radio value="2009">2009</Radio>
              </Row>
              <Row>
                <Radio value="2008">2008</Radio>
              </Row>
              <Row>
                <Radio value="2007">2007</Radio>
              </Row>
            </Radio.Group>
          </Sider>
        </Layout>
      </Layout>
    )
  }
}

export default Home
