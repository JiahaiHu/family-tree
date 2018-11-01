import React from 'react';
import styles from '../styles/Project.less';
import classnames from 'classnames';

class ProjectInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      scrolled: false,
    }
  }

  componentDidMount() {
    let onScroll = e => this.onScroll(e)
    this.projectContentWrapperRef.addEventListener('scroll', onScroll)
  }

  onScroll = () => {
    const scrolled = this.projectContentWrapperRef.scrollTop > 0
    this.setState({ scrolled })
  }

  render() {
    const projectHeaderCls= classnames({
      [styles.projectHeader]: true,
      [styles.shadow]: this.state.scrolled,
    })
    return (
      <div className={styles.projectInfo}>
        <div className={projectHeaderCls}>
          <div className={styles.projectTime}>(<span>2017.06</span> - <span>2018.01</span>)</div>
          <div className={styles.projectTitle}>title</div>
        </div>
        <div
          className={styles.projectContentWrapper}
          ref={ el => this.projectContentWrapperRef = el }
        >
          <div className={styles.projectContent}>
            <div>markdown</div>
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
            <div>end</div>
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectInfo