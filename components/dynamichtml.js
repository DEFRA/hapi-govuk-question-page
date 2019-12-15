const hoek = require('@hapi/hoek')

const { Component } = require('.')

const PARAMETER_TOKEN = /\$PARAM\$/g

class DynamicHtml extends Component {
  getViewModel (config) {
    const { templateHtml } = this

    const { [this.name]: { parameterValues = [] } = {} } = config
    const cleanParameterValues = parameterValues.map(parameterValue => hoek.escapeHtml('' + parameterValue))

    const content = templateHtml.replace(PARAMETER_TOKEN, () => cleanParameterValues.shift() || '')

    return {
      content
    }
  }
}

module.exports = DynamicHtml
