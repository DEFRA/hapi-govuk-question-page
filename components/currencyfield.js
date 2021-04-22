const TextField = require('./textfield')
const toCurrency = require('../lib/tocurrency')

class CurrencyField extends TextField {
  constructor (definition) {
    super(definition)
    this.options = this.options || {}
    if (!this.options.classes) {
      this.options.classes = 'govuk-input--width-10'
    }
    if (!this.options.prefix) {
      this.options.prefix = { text: '£' }
    }
  }

  getStateFromValidForm (validatedFormData) {
    return {
      [this.name]: toCurrency(validatedFormData[this.name])
    }
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.attributes.spellcheck = 'false'
    return viewModel
  }
}

module.exports = CurrencyField
