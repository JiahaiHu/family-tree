import React, { Component } from 'react'

class Curves extends Component {
  constructor(props) {
    super(props)
  }

  getPath(p) {
    return (
      <path d={`M ${p.x1},${p.y1} C ${p.x2},${p.y2} ${p.x3},${p.y3} ${p.x4},${p.y4}`} stroke="#8c9eff" fill="none"></path>
    )
  }

  render() {
    const { width, originYL, originYR } = this.props
    const p = {
      x1: 0,
      y1: 37+54*2+originYL,
      x2: width/2,
      y2: 37+54*2+originYL,
      x3: width/2,
      y3: 37+54*3+originYR,
      x4: width,
      y4: 37+54*3+originYR,
    }

    return (
      <svg width="100%" height="100%">
        {this.getPath(p)}
      </svg>
    )
  }
}

export default Curves
