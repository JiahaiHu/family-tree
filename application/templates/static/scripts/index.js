import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Circles from './Circles';
import CircleWithTag from './CircleWithTag';
import IndexForm from './IndexFrom';
import styles from '../styles/index.css';

class App extends React.Component {
  render() {
    return (
      <div className={classnames(styles.wrapper, styles.gradBgColor)}>
        <div className={styles.circlesContainer}>
          <Circles X='70%' Y='20%' R='15%' d='20%' r='20%' deg='200' circleNum='3' />        
          <CircleWithTag x='50%' y='40%' r='40%' deg='160' />
          <CircleWithTag x='65%' y='45%' r='10%' deg='270' />
          <CircleWithTag x='25%' y='65%' r='8%' deg='90' />
        </div>
        <IndexForm />
        {/* <Circles X='35%' Y='80%' R='6%' d='10%' r='20%' /> */}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
