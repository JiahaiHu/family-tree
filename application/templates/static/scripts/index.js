import React from 'react';
import ReactDOM from 'react-dom';
import Circles from './Circles';
import CircleWithTag from './CircleWithTag';
import styles from '../styles/index.css';

class App extends React.Component {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.circlesContainer}>
          <CircleWithTag x='50%' y='50%' r='40%' />
          <CircleWithTag x='70%' y='50%' r='10%' />
          <CircleWithTag x='30%' y='70%' r='10%' />
        </div>
        <div className={styles.home}></div>
        <Circles X='40%' Y='80%' R='8%' d='20%' r='20%' />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
