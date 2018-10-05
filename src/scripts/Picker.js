import React from 'react';
import classnames from 'classnames';
import popStyles from '../styles/Popover.less'
import styles from '../styles/Picker.less';
import { Popover } from 'antd'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const scrollTo = (element, to, duration) => {
  const requestAnimationFrame = window.requestAnimationFrame ||
    function requestAnimationFrameTimeout() {
      return setTimeout(arguments[0], 10);
    };
  // jump to target if duration zero
  if (duration <= 0) {
    element.scrollTop = to;
    return;
  }
  const difference = to - element.scrollTop;
  const perTick = difference / duration * 10;

  requestAnimationFrame(() => {
    element.scrollTop = element.scrollTop + perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  });
};

class Picker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,  // mouseover
    };
  }

  onScroll = () => {
    if (this.props.onScroll) {
      const picker = this.pickerRef
      this.props.onScroll(picker.scrollTop)
    }
  }

  componentDidMount() {
    let onScroll = e => this.onScroll(e);
    this.pickerRef.addEventListener('scroll', onScroll);
  }

  componentDidUpdate(prevProps) {
    // smooth scroll to selected option
    if (prevProps.focusedIndex !== this.props.focusedIndex) {
      this.scrollToFocused(120);
    }
  }

  onclick = (userId) => {
    const { onclick } = this.props;
    onclick(userId);
  }

  getItems() {
    const { items, selected, focusedIndex } = this.props;
    return items.map((item, index) => {
      let cls
      if (item.groupNames.length) {
        cls= classnames({
          [styles[`${item.groupNames[0]}`]]: true,
          [styles.selectedItem]: focusedIndex === index && selected,
        })
      } else {
        cls= classnames({
          [styles.selectedItem]: focusedIndex === index && selected,
        })
      }

      return (
        <Popover placement="rightTop" content={this.getUserPopover(item)}>
        <li
          className={cls}
          key={index}
          onClick={this.onclick.bind(this, item.id)}
        >
          <i></i>
          <span className={styles.itemText}>{item.realname}</span>
          <span className={styles.itemTag}>[{item.enrollmentYear-2000}]</span>
        </li>
        </Popover>
      )
    })
  }

  scrollToFocused(duration) {
    // move to focused item
    const picker = this.pickerRef;
    const list = this.listRef;
    if (!list) {
      return;
    }
    let index = this.props.focusedIndex;
    if (index < 0) {
      index = 0;
    }
    const topOption = list.children[index];
    const to = topOption.offsetTop;
    scrollTo(picker, to, duration);
  }

  handleMouseEnter = () => {
    this.setState({ active: true });
  }

  handleMouseLeave = () => {
    this.setState({ active: false });
  }

  getUserPopover(user) {
    return (
      <div className={popStyles.card}>
        <div className={classnames(popStyles.cardItem, popStyles.avatar)}>
          <div className={popStyles.cardItemLabel}>
            <div></div>
          </div>
          <div>
            <div>{user.groupNames[0] || 'undefined'}</div>
            <div>
              <span className={popStyles.avatarName}>{user.realname}</span>({this.props.year} - {parseInt(user.enrollmentYear) + 4})
            </div>
          </div>
        </div>
        <div className={popStyles.cardItem}>
          <div className={popStyles.cardItemLabel}>TEL</div>
          <div>{user.phone || 'xxxxxxxxxxx'}</div>
        </div>
        <div className={popStyles.cardItem}>
          <div className={popStyles.cardItemLabel}>EMAIL</div>
          <div>{user.email || 'xxx@email'}</div>
        </div>
        <div className={popStyles.line}></div>
        {/* TODO: query project by id */}
        <div className={popStyles.projectItem}>
          <div className={popStyles.projectTitle}>
            <div className={popStyles.projectLabel}>project1</div>
            <div className={popStyles.projectName}>xxxxxx</div>
          </div>
          <div className={popStyles.projectContent}>xxxxxxxxx</div>
        </div>
        <div className={popStyles.projectItem}>
          <div className={popStyles.projectTitle}>
            <div className={popStyles.projectLabel}>project2</div>
            <div className={popStyles.projectName}>xxxxxx</div>
          </div>
          <div className={popStyles.projectContent}>xxxxxxxxx</div>
        </div>
        <a>more...</a>
      </div>
    )
  }

  render() {
    const cls = classnames({
      [styles.picker]: 1,
      [styles.pickerActive]: this.state.active,
    });
    return (
      <div className={styles.pickerContainer}>
        <div
          ref={ el => this.pickerRef = el }
          className={cls}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <ul ref={ el => this.listRef = el }>{this.getItems()}</ul>
        </div>
      </div>
    )
  }

}

export default Picker