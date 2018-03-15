import React from 'react';
import styles from '../styles/index.css';

class CircleWithTag extends React.Component {
  static defaultProps = {
    deg: 0,
  };
  render() {
    const { x, y, r, deg} = this.props;
    const circleStyle = {
      top: `${x-r}px`,
      left: `${x-r}px`,
      width: `${2*r}px`,
      height: `${2*r}px`,
    };
    return <div className={styles.circle} style={circleStyle} />;
  }
}

export default CircleWithTag;