const { Component } = require('.')

class WarningText extends Component {
  getViewModel () {
    return {
      text: this.text,
      iconFallbackText: this.summary || 'Warning'
    }
  }
}

module.exports = WarningText
