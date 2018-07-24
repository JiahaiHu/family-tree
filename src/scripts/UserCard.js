import React from 'react';
import styles from '../styles/UserCard.less';
import classnames from 'classnames';

class UserCard extends React.Component {
  constructor(props) {
    super(props);
  }

  getAvatar() {
    return (
      <div className={classnames(styles.card, styles.avatar)}>
        <div className={styles.cardItem}>
          <div className={styles.cardItemLable}>
            <img />
          </div>
          <div className={styles.cardItemContent}>
            <div className={styles.avatarName}>陆子叶</div>
            <div style={{ color: '#8c9eff' }}>(<span>2017</span> - <span>2020</span>)</div>
          </div>
        </div>
      </div>
    )
  }

  getCard(items) {
    const cardItems = items.map((item, index) => {
      const cls = classnames({
        [styles.cardItem]: true,
        [styles.abilities]: item.label === 'abilities',
      })
      return (
        <div className={cls}>
          <div className={styles.cardItemLable}>
            {item.label}
          </div>
          <div className={styles.cardItemContent}>
            <span>{item.content}</span>
          </div>
        </div>
      )
    })

    return (
      <div className={styles.card}>
        {cardItems}
      </div>
    )
  }

  render() {
    const { userinfo } = this.props
    const labels = [
      ['group', 'abilities'],
      ['tel', 'email', 'location', 'wechat'],
      ['mentor', 'mentee', 'company']
    ]
    const cards = []; // [items, ...]
    // abstract info
    for (var i = 0; i < labels.length; i = i + 1) {
      cards.push(
        // items
        labels[i].map((item, index) => {
          return {
            label: item,
            content: userinfo[item],
          }
        })
      )
    }
    return (
      <div className={styles.userCardContainer}>
        {this.getAvatar()}
        {cards.map((item, index) => {
          return this.getCard(item)
        })}
      </div>
    )
  }

}

export default UserCard