const { Component } = require('.')

class Html extends Component {
  getViewModel () {
    return {
      content: this.content
    }
  }
}

module.exports = Html
