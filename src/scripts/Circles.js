import React from 'react';
import classnames from 'classnames';
import styles from '../styles/index.css';

class Circles extends React.Component {
  static defaultProps = {
    X: '50%',
    Y: '50%',
    R: '10%',
    d: '0%',
    r: '25%',
    circleNum: 2,
    deg: 0,
  };

  render() {
    const { X, Y, d, R, r, circleNum, deg } = this.props;
    const rad = Math.PI * deg / 180;
    const deltaDistance = `calc(${d} / ${circleNum})`;
    const deltaRadius = `calc((50% - ${d} - ${r}) / ${circleNum})`;
    const circleProps = [];
    for (let i = 0; i < circleNum; i++) {
      const distance = `calc(${d} - ${i} * ${deltaDistance})`;
      circleProps.push({
        x: `calc(50% + ${distance} * ${Math.cos(rad)})`,
        y: `calc(50% - ${distance} * ${Math.sin(rad)})`,  // exist error
        radius: `calc(${r} + ${i} * (${deltaDistance} + ${deltaRadius}))`,
      });
    }
    const wrapperStyle = {
      left: `calc(${X})`,
      top: `calc(${Y})`,
      width: `calc(2 * ${R})`,
      paddingTop: `calc(2 * ${R})`,
      marginLeft: `calc(-${R})`,
      marginTop: `calc(-${R})`,
      border: 'none',
    };
    return (
        <div className={classnames(styles.circle, styles.gradBgColor)} style={wrapperStyle}>
          { circleProps.map((item, index) => {
            const circleStyle = {
              left: `calc(${item.x})`,
              top: `calc(${item.y})`,
              width: `calc(2 * ${item.radius})`,
              paddingTop: `calc(2 * ${item.radius})`,
              marginLeft: `calc((-1) * ${item.radius})`,
              marginTop: `calc((-1) * ${item.radius})`,
              border: 'solid 1px rgba(255, 255, 255, .3)',
            };
            return <div className={styles.circle} style={circleStyle} />
          })}
        </div>
    );
  }
}

export default Circles;