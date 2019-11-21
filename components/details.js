const { Component } = require('.')

class Details extends Component {
  getViewModel () {
    return {
      summaryHtml: this.title,
      html: this.content
    }
  }
}

module.exports = Details
