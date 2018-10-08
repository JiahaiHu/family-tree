import React, { Component } from 'react'

class Curves extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { width, originYL, originYR, pairsOfIndex } = this.props
    
    const paths = pairsOfIndex.map((pair, index) => {
      const p = {
        x1: 0,
        y1: 37 + 54 * pair.mentorIndex + originYL,
        x2: width / 2,
        y2: 37 + 54 * pair.mentorIndex + originYL,
        x3: width / 2,
        y3: 37 + 54 * pair.menteeIndex + originYR,
        x4: width,
        y4: 37 + 54 * pair.menteeIndex + originYR,
      }

      return <path key={index} d={`M ${p.x1},${p.y1} C ${p.x2},${p.y2} ${p.x3},${p.y3} ${p.x4},${p.y4}`} stroke="#8c9eff" fill="none"></path>
    })
    

    return (
      <svg width={width} height="100%">
        {paths}
      </svg>
    )
  }
}

export default Curves
