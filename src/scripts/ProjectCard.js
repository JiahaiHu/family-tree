import React from 'react';
import styles from '../styles/ProjectCard.less';
import imgURL from '../assets/avatar.jpg';

class ProjectCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { index } = this.props;
    return (
      <div className={styles.card}>
        <div className={styles.header}>{`Project ${index}`}</div>
        <div className={styles.title}>项目</div>
        <div>
          <span className={styles.lable}>Admin</span>
          <span className={styles.content}>Lu ziye</span>
          <span className={styles.lable}>Members</span>
          <span className={styles.content}>Lu ziye, xxx, xxx</span>
        </div>
        <div className={styles.images}>
          <img src={imgURL} />
          <img src={imgURL} />
          <img src={imgURL} />
          <img src={imgURL} />
        </div>
        <p>项目介绍</p>
        <div className={styles.tag}>
          <span>{index}</span>
          <span>2018</span>
          <span>02</span>
          <span>-</span>
          <span>present</span>
        </div>
      </div>
    )
  }
}

export default ProjectCard