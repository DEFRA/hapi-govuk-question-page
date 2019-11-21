const { Component } = require('.')

class Para extends Component {
  getViewModel () {
    return {
      content: this.content
    }
  }
}

module.exports = Para
