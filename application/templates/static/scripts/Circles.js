import React from 'react';
import styles from '../styles/index.css';

class Circles extends React.Component {
  static defaultProps = {
    X: 100,
    Y: 100,
    d: 30,
    R: 100,
    r: 40,
    circleNum: 2,
    deg: 0,
  };

  render() {
    const { X, Y, d, R, r, circleNum, deg } = this.props;
    const rad = Math.PI * deg / 180;
    const deltaDistance = d / circleNum;
    const deltaRadius = (R - d - r) / circleNum;
    const circleProps = [];
    for (let i = 0; i < circleNum; i++) {
      const distance = d - i * deltaDistance;
      circleProps.push({
        x: R + distance * Math.cos(rad),
        y: R - distance * Math.sin(rad),
        radius: r + i * (deltaDistance + deltaRadius),
      });
    }
    const wrapperStyle = {
      left: `${X-R}px`,
      top: `${Y-R}px`,
      width: `${2*R}px`,
      height: `${2*R}px`
    };
    return (
        <div className={styles.circle} style={wrapperStyle}>
          { circleProps.map((item, index) => {
            const circleStyle = {
              left: `${item.x-item.radius}px`,
              top: `${item.y-item.radius}px`,
              width: `${2*item.radius}px`,
              height: `${2*item.radius}px`
            };
            return <div className={styles.circle} style={circleStyle} />
          })}
        </div>
    );
  }
}

export default Circles;
