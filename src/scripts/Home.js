import React from 'react'
import { Layout, Checkbox, Radio, Row, Col, Icon } from 'antd'
import styles from '../styles/Home.less'
import classnames from 'classnames'
import Picker from './Picker'
import Curves from './Curves'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const { Header, Content, Footer, Sider } = Layout

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      checkedGroups: [],
      checkedYears: [],
      checkedGenders: [],
      focusedYear: 2017,
      // TODO: minVisibleIndex: [], // for line's visibility
      originY1: 0,
      originY2: 0,
      originY3: 0,
    };

    this.svgWidth = null
    this.nextWidth = null
    this.svgContainerRef = null

    this.setSvgContainerRef = el => {
      this.svgContainerRef = el
    }

  }

  data = {}
  focusedIndex = {}
  selectedYear = null;

  componentDidMount() {
    // window.addEventListener('resize', this.getSvgWidth)
  }

  componentDidUpdate() {
    this.svgWidth = this.nextWidth
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

  groupCheckHandler = (checkedGroups) => {
    this.setState({
      checkedGroups,
    })
  }

  yearCheckHandler = (checkedYears) => {
    this.setState({
      checkedYears,
    })
  }

  genderCheckHandler = (checkedGenders) => {
    this.setState({
      checkedGenders,
    })
  }

  focusedYearCheckHandler = (e) => {
    this.setState({
      focusedYear: e.target.value,
    })
  }

  onclick = (year, userId) => {
    this.setState({
      selectedUserId: userId,
    });
    this.selectedYear = year
  }

  onScroll = (n, scrollTop) => {
    if (n == 1) {
      this.setState({
        originY1: -scrollTop,
      })
    } else if (n == 2) {
      this.setState({
        originY2: -scrollTop,
      })
    } else if (n == 3) {
      this.setState({
        originY3: -scrollTop,
      })
    }
  }

  groups = [];

  getGroupName() {
    const GET_GROUPS = gql`
      {
        group {
          id
          groupName
        }
      }
    `

    return (
      <Query query={GET_GROUPS}>
        {({ loading, error, data }) => {
          if (loading) return ''
          if (error) {
            console.log(error)
            return 'Error!'
          }
          this.groups = data.group
          return ''
        }}
      </Query>
    )
  }

  addGroupNames(users) {
    const groups = this.groups

    return users.map(user => {
      let groupNames
      if (user.groupIDs.length) {
        groupNames = user.groupIDs.map(groupID => {
          return groups.find(group => groupID === group.id).groupName
        })
      } else {
        groupNames = []
      }

      return Object.assign({groupNames}, user)
    })
  }

  filterUsers(users) {
    const checkedGroups = this.state.checkedGroups
    const checkedYears = this.state.checkedYears
    const checkedGenders = this.state.checkedGenders
    
    let filteredUsers = users
    if (checkedGroups.length) {
      filteredUsers = filteredUsers.filter(user => {
        let willBeFiltered = true
        checkedGroups.find(group => {
          if (user.groupNames.includes(group)) {
            willBeFiltered = false
            return true
          } else {
            return false
          }
        })
        return !willBeFiltered
      })
    }
    if (checkedYears.length) {
      filteredUsers = filteredUsers.filter(user => {
        return checkedYears.includes(user.enrollmentYear.toString())
      })
    }
    if (checkedGenders.length) {
      filteredUsers = filteredUsers.filter(user => {
        return checkedGenders.includes(user.gender.toString())
      })
    }
    return filteredUsers
  }

  getSvgWidth() {
    this.nextWidth = this.svgContainerRef.clientWidth
    return this.svgWidth || this.nextWidth
  }

  getPicker(year, nth) {
    const GET_USERS = gql`
    {
      user(joinedYear: ${year}) {
        id
        realname
        mentorIDs
        menteeIDs
        groupIDs
        enrollmentYear
        gender
        # TODO: for user popover
        # phone
        # email
        # projectIDs
      }
    }
    `

    return (
      <Query query={GET_USERS}>
        {({ loading, error, data }) => {
          if (loading) return 'loading...'
          if (error) {
            console.log(error)
            return 'Error!'
          }

          const users = this.filterUsers(this.addGroupNames(data.user))
          this.data[year] = users

          const selectedYear = this.selectedYear
          const selectedUserId = this.state.selectedUserId

          if (selectedYear && selectedUserId) {
            // TODO: create near years' focusedIndex
            this.focusedIndex[selectedYear] = this.data[selectedYear].findIndex(user => user.id === selectedUserId)
            
            if (this.data[selectedYear+1])
              this.focusedIndex[selectedYear+1] = this.data[selectedYear+1].findIndex(user => {
                return user.mentorIDs.includes(selectedUserId)
              })
            
            if (this.data[selectedYear-1])
              this.focusedIndex[selectedYear-1] = this.data[selectedYear-1].findIndex(user => {
                return user.menteeIDs.includes(selectedUserId)
              })
          }
          
          return (
            <Picker
              year={year}
              items={users}
              selected={selectedYear === year}
              focusedIndex={this.focusedIndex[year]}
              onclick={this.onclick.bind(this, year)}
              onScroll={this.onScroll.bind(this, nth)}
            />            
          )
        }}
      </Query>
    )
  }

  getCurves(y1, y2) {
    const GET_USERS = gql`
    {
      mentors: user(joinedYear: ${y1}) {
        id
        realname
        mentorIDs
        menteeIDs
        groupIDs
        joinedYear
        enrollmentYear
        gender
      }
      mentees: user(joinedYear: ${y2}) {
        id
        realname
        mentorIDs
        menteeIDs
        groupIDs
        joinedYear
        enrollmentYear
        gender
      }
    }
    `

    return (
      <Query query={GET_USERS}>
        {({ loading, error, data }) => {
          if (loading) return 'loading...'
          if (error) {
            console.log(error)
            return 'Error!'
          }
          
          const filteredMentors = this.filterUsers(this.addGroupNames(data.mentors))
          const filteredMentees = this.filterUsers(this.addGroupNames(data.mentees))
          const mentors = filteredMentors.filter(user => user.menteeIDs.length !== 0)
          const mentees = filteredMentees.filter(user => user.mentorIDs.length !== 0)
          if (!mentors.length || !mentees.length) return ''

          const pairsOfIndex = mentors.map(mentor => {
            const mentorIndex = filteredMentors.findIndex(user => user.id === mentor.id)
            const menteeIndexs = mentor.menteeIDs.map(id => {
              return filteredMentees.findIndex(user => user.id === id)
            })

            const pairsOfIndex = menteeIndexs.map(index => {
              return {
                mentorIndex,
                menteeIndex: index,
              }
            })
            return pairsOfIndex
          }).reduce((preArray, curArray) => preArray.concat(curArray))

          const n1 = 2 + y1 - this.state.focusedYear
          const n2 = 2 + y2 - this.state.focusedYear
    
          return (
            <Curves
              pairsOfIndex={pairsOfIndex}
              originYL={this.state[`originY${n1}`]}
              originYR={this.state[`originY${n2}`]}
              width={this.getSvgWidth()}
            />            
          )
        }}
      </Query>
    )
  }

  getTimeLine() {
    const focusedYear = parseInt(this.state.focusedYear)
    return (
      <div className={styles.timeline}>
        <ul>
          <li style={{ left: '30px' }}>...<span></span></li>
          <li style={{ left: '20%' }}>{focusedYear-1}<span></span></li>
          <li style={{ left: '60%' }}>{focusedYear}<span></span></li>
          <li style={{ left: '100%' }}>{focusedYear+1}<span></span></li>
        </ul>
      </div>
    )
  }

  render() {
    const collapsedWidth = 160
    const focusedYear = parseInt(this.state.focusedYear)

    
    
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
                    <Checkbox value="AI" className={styles.AILab}>AI</Checkbox>
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
                    <Checkbox value="true">Male</Checkbox>
                  </Row>
                  <Row>
                    <Checkbox value="false">Female</Checkbox>
                  </Row>
                </Checkbox.Group>
              </div>
            </div>
          </Sider>
          <Content className={styles.homeContent} >
            <div className={styles.timelineContainer} >
              {this.getGroupName()}
              {this.getTimeLine()}
            </div>
            <div className={styles.homeContentCol} style={{ left: '18%' }} >
              {this.getPicker(focusedYear-1, 1)}
            </div>
            <div className={styles.homeContentCol} style={{ left: '36%', width: 'calc(36% - 166px)' }} ref={this.setSvgContainerRef}>
              {this.getCurves(focusedYear-1, focusedYear)}
            </div>
            <div className={styles.homeContentCol} style={{ left: '54%' }} >
              {this.getPicker(focusedYear, 2)}
            </div>
            <div className={styles.homeContentCol} style={{ left: '72%', width: 'calc(36% - 166px)' }} >
            {this.getCurves(focusedYear, focusedYear+1)}
            </div>
            <div className={styles.homeContentCol} style={{ left: '90%' }} >
              {this.getPicker(focusedYear+1, 3)}
            </div>
          </Content>
          <Sider className={styles.rightSider} width={160}>
            <Radio.Group onChange={this.focusedYearCheckHandler}>
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
