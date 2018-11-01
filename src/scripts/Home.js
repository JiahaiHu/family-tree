import React from 'react'
import { Layout, Checkbox, Radio, Row, Col, Icon, Popover, Dropdown } from 'antd'
import styles from '../styles/Home.less'
import classnames from 'classnames'
import Picker from './Picker'
import Curves from './Curves'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const { Header, Content, Footer, Sider } = Layout

const scrollTo = (element, to, duration) => {
  const requestAnimationFrame = window.requestAnimationFrame ||
    function requestAnimationFrameTimeout() {
      return setTimeout(arguments[0], 10);
    };
    
  // jump to target if duration zero
  if (duration <= 0) {
    element.scrollLeft = to;
    return;
  }
  
  const difference = to - element.scrollLeft;
  const perTick = difference / duration * 10;

  requestAnimationFrame(() => {
    element.scrollLeft = element.scrollLeft + perTick;
    if (element.scrollLeft === to) return;
    scrollTo(element, to, duration - 10);
  });
}

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true,
      checkedGroups: [],
      checkedYears: [],
      checkedGenders: [],
      focusedYear: 2017,
      // TODO: minVisibleIndex: [], // for line's visibility
      // TODO: origin: {}
      originY1: 0,
      originY2: 0,
      originY3: 0,
    };

  }

  data = {}
  focusedIndex = {}
  selectedYear = null

  componentDidMount() {
    // window.addEventListener('resize', this.getSvgWidth)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.focusedYear !== this.state.focusedYear) {
      this.scrollToFocused(120)
    }
  }

  scrollToFocused(duration) {
    // move to focused item
    const container = this.containerRef
    const timeline = this.timelineRef
    if (!timeline) return
    
    // TODO: 2016->2007
    let index = this.state.focusedYear - 2016
    index = index - 1
    if (index < 0) {
      index = 0
    }

    const topOption = timeline.children[index]
    const to = topOption.offsetLeft - 166
    scrollTo(container, to, duration)
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
    const focusedYear = e.target.value
    this.setState({
      focusedYear,
    })
  }

  onclick = (year, userId) => {
    this.setState({
      selectedUserId: userId,
    });
    this.selectedYear = year
  }

  onScroll = (n, scrollTop) => {
    // TODO:
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

  groups = [
    {
      "groupName": "AI",
      "id": 1
    },
    {
      "groupName": "Android",
      "id": 2
    },
    {
      "groupName": "Design",
      "id": 3
    },
    {
      "groupName": "iOS",
      "id": 4
    },
    {
      "groupName": "Lab",
      "id": 5
    },
    {
      "groupName": "Game",
      "id": 6
    },
    {
      "groupName": "PM",
      "id": 7
    },
    {
      "groupName": "Web",
      "id": 8
    }
  ]

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

  getPicker(year, nth) {
    const GET_USERS = gql`
    {
      user(joinedYear: ${year}) {
        id
        realname
        mentorIDs
        menteeIDs
        groupIDs
        joinedYear
        enrollmentYear
        gender
        # for user popover
        email
        phone
        projectIDs
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
            // create near years' focusedIndex
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
        enrollmentYear
        gender
      }
      mentees: user(joinedYear: ${y2}) {
        id
        realname
        mentorIDs
        menteeIDs
        groupIDs
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
          if (!mentors.length || !mentees.length)
            return (
              <Curves
                pairsOfIndex={[]}
                originYL={this.state[`originY${n1}`]}
                originYR={this.state[`originY${n2}`]}
                width={150}
              />
            )

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

          // TODO:
          const n1 = 2 + y1 - 2017
          const n2 = 2 + y2 - 2017

          return (
            <Curves
              pairsOfIndex={pairsOfIndex}
              originYL={this.state[`originY${n1}`]}
              originYR={this.state[`originY${n2}`]}
              width={150}
            />
          )
        }}
      </Query>
    )
  }

  getTimeLine() {
    const width = 166 + 150 // PickerWidth + CurvesWidth
    const firstPos = 100 + 166/2
    return (
      <div className={styles.timeline}>
        <ul ref={ el => this.timelineRef = el }>
          <li style={{ left: firstPos+'px' }}>{2016}<span></span></li>
          <li style={{ left: firstPos+width+'px' }}>{2017}<span></span></li>
          <li style={{ left: firstPos+width*2+'px' }}>{2018}<span></span></li>
          <li style={{ left: firstPos+width*3+'px' }}>{2019}<span></span></li>
          <li style={{ left: firstPos+width*4+'px' }}>{2020}<span></span></li>
        </ul>
      </div>
    )
  }

  getGroupPopover(groupName) {
    return (
      <div>
        <div>{groupName}</div>
        <p>简介</p>
        <a>more...</a>
      </div>
    )
  }

  getGroupFilterList = () => {
    return this.groups.map((group, index) => {
      const name = group.groupName
      return (
        <Row key={index}>
          <Popover placement="rightTop" content={this.getGroupPopover(name)}>
            <Checkbox value={name} className={styles[name]}>{name}</Checkbox>
          </Popover>
        </Row>
      )
    })
  }

  getAvatar = () => {
    const username = localStorage.getItem('username')
    const GET_AVATAR_URL = gql`
    {
      user(username: ${username}) {
        avatar
      }
    }
    `
    return (
      <Query query={GET_AVATAR_URL}>
        {({ loading, error, data }) => {
          const defaultUrl = "data:image/png;base64,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"
          if (loading) return ''
          if (error) {
            console.log(error)
            return <img width={40} src={defaultUrl} />
          }

          const avatarUrl = data.user[0].avatar
          return <img width={40} src={avatarUrl} />
        }}
      </Query>
    )
  }

  logOut = () => {
    localStorage.clear()
    this.props.history.push('/')
  }

  render() {
    const collapsedWidth = 160
    const focusedYear = this.state.focusedYear
    const userMenu = (
      <div className={styles.userMenu}>
        <a href="/user">Profile</a>
        <a href="/company">Company</a>
        <a onClick={this.logOut}>Log out</a>
      </div>
    )
    return (
      <Layout className={classnames(styles.wrapper, styles.home)} >
        <Header className={styles.homeHeader} >
          <span>Family Tree</span>
          <Dropdown overlay={userMenu} trigger={['click']} >
            <div className={styles.avatar} >{this.getAvatar()}</div>
          </Dropdown>
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
                  {this.getGroupFilterList()}
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
          <Content>
          <div className={styles.homeContentContainer} ref={ el => this.containerRef = el } >
            <div className={styles.homeContent} style={{ width: '2000px' }} >
              <div className={styles.timelineContainer} >
                {this.getTimeLine()}
              </div>
              <div className={styles.homeContentCol} >
                {this.getPicker(2016, 1)}
              </div>
              <div className={styles.homeContentCol}>
                {this.getCurves(2016, 2017)}
              </div>
              <div className={styles.homeContentCol} >
                {this.getPicker(2017, 2)}
              </div>
              <div className={styles.homeContentCol}>
                {this.getCurves(2017, 2018)}
              </div>
              <div className={styles.homeContentCol} >
                {this.getPicker(2018, 3)}
              </div>
            </div>
            </div>
          </Content>
          <Sider className={styles.rightSider} width={160}>
            <Radio.Group onChange={this.focusedYearCheckHandler}>
              <Row>
                <Radio value={2018}>2018</Radio>
              </Row>
              <Row>
                <Radio value={2017}>2017</Radio>
              </Row>
              <Row>
                <Radio value={2016}>2016</Radio>
              </Row>
              <Row>
                <Radio value={2015}>2015</Radio>
              </Row>
              <Row>
                <Radio value={2014}>2014</Radio>
              </Row>
              <Row>
                <Radio value={2013}>2013</Radio>
              </Row>
              <Row>
                <Radio value={2012}>2012</Radio>
              </Row>
              <Row>
                <Radio value={2011}>2011</Radio>
              </Row>
              <Row>
                <Radio value={2010}>2010</Radio>
              </Row>
              <Row>
                <Radio value={2009}>2009</Radio>
              </Row>
              <Row>
                <Radio value={2008}>2008</Radio>
              </Row>
              <Row>
                <Radio value={2007}>2007</Radio>
              </Row>
            </Radio.Group>
          </Sider>
        </Layout>
      </Layout>
    )
  }
}

export default Home
