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
          <CircleWithTag x='450' y='300' r='400' />
          <CircleWithTag x='650' y='350' r='100' />
          <CircleWithTag x='250' y='450' r='80' />
        </div>
        <div className={styles.home}></div>
        <Circles X='300' Y='550' />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
