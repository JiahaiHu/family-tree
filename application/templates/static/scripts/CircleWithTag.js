import React from 'react';
import styles from '../styles/index.css';

class CircleWithTag extends React.Component {
  static defaultProps = {
    deg: 0,
  };
  render() {
    const { x, y, r, deg} = this.props;
    const circleStyle = {
      top: `calc(${y})`,
      left: `calc(${x})`,
      width: `calc(2 * ${r})`,
      paddingTop: `calc(2 * ${r})`,
      marginLeft: `calc(-${r})`,
      marginTop: `calc(-${r})`,
    };
    return <div className={styles.circle} style={circleStyle} />;
  }
}

export default CircleWithTag;