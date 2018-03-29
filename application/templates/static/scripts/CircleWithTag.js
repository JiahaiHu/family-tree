import React from 'react';
import styles from '../styles/index.css';
import classnames from 'classnames';

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
      border: 'solid 1px rgba(255, 255, 255, .7)',
    };
    const rad = Math.PI * deg / 180;
    const tagStyle = {
      top: `${50 * (1 - Math.sin(rad))}%`,
      left: `${50 * (1 + Math.cos(rad))}%`,
    };
    return (
      <div className={classnames(styles.circle, styles.rotate)} style={circleStyle}>
        <div className={styles.tag} style={tagStyle} />
      </div>
    );
  }
}

export default CircleWithTag;