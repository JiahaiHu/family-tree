import React from 'react';
import styles from '../styles/Project.less';

class ProjectInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.projectInfo}>
        <div className={styles.projectHeader}>
          <div className={styles.projectTime}>(<span>2017.06</span> - <span>2018.01</span>)</div>
          <div className={styles.projectTitle}>title</div>
        </div>
        <div className={styles.projectContent}>content</div>
      </div>
    )
  }
}

export default ProjectInfo