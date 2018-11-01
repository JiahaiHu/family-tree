import React from 'react';
import styles from '../styles/Popover.less'
import classnames from 'classnames';

class UserPopover extends React.Component {
  constructor(props) {
    super(props);
  }

  getProjects = (user) => {
    const projectItems = user.projectIDs.map((id, index) => {
      const GET_PROJECTS = gql`
      {
        project(id: ${id}) {
          title
          description
        }
      }
      `
      return (
        <Query query={GET_PROJECTS}>
          {({ loading, error, data }) => {
            if (loading) return 'loading...'
            if (error) {
              console.log(error)
              return 'Error!'
            }
            return (
              <div className={styles.projectItem}>
                <div className={styles.projectTitle}>
                  <div className={styles.projectLabel}>{index+1}</div>
                  <div className={styles.projectName}>{data.project[0].title}</div>
                </div>
                <div className={styles.projectContent}>{data.project[0].description}</div>
              </div>
            )
          }}
        </Query>
      )
    })
    return projectItems
  }
  
  render() {
    const { user, containerStyle } = this.props

    return (
      <div className={styles.card} style={containerStyle}>
        <div className={classnames(styles.cardItem, styles.avatar)}>
          <div className={styles.cardItemLabel}>
            <div></div>
          </div>
          <div>
            <div>{user.groupNames[0] || 'Undefined'}</div>
            <div>
              <span className={styles.avatarName}>{user.realname}</span>({user.joinedYear} - {parseInt(user.enrollmentYear) + 4})
            </div>
          </div>
        </div>
        <div className={styles.cardItem}>
          <div className={styles.cardItemLabel}>TEL</div>
          <div>{user.phone || 'un-de-fined'}</div>
        </div>
        <div className={styles.cardItem}>
          <div className={styles.cardItemLabel}>EMAIL</div>
          <div>{user.email || 'un@de.fined'}</div>
        </div>
        <div className={styles.line}></div>
        {this.getProjects(user)}
        <a>more...</a>
      </div>
    )
  }
}

export default UserPopover