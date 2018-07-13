import React from 'react';
import ReactDom from 'react-dom';
import classnames from 'classnames';
import styles from '../styles/Picker.less';


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
      active: false,
    };
  }

  componentDidUpdate(prevProps) {
    // smooth scroll to selected option
    if (prevProps.focusedIndex !== this.props.focusedIndex) {
      this.scrollToFocused(120);
    }
  }

  onclick = (index) => {
    const { onclick, year } = this.props;
    onclick(year, index);
  }

  getItems() {
    const { items } = this.props;
    return items.map((item, index) => {
      return (
        <li
          className={styles.pickerListItem}
          key={index}
          onClick={this.onclick.bind(this, item)}
        >
          {item}
        </li>
      )
    })
  }

  scrollToFocused() {
    // move to focused item
    const picker = ReactDom.findDOMNode(this);
    const list = ReactDom.findDOMNode(this.refs.list);
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

  saveList = (node) => {
    this.list = node;
  }

  render() {
    const cls = classnames({
      [styles.picker]: 1,
      [styles.pickerActive]: this.state.active,
    });
    return (
      <div
        className={cls}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <ul rel={'list'}>{this.getItems()}</ul>
      </div>
    )
  }

}

export default Picker