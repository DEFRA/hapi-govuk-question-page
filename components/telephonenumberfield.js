const TextField = require('./textfield')

class TelephoneNumberField extends TextField {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.type = 'tel'
    if (this.options.autocomplete) {
      viewModel.autocomplete = 'tel'
    }
    return viewModel
  }
}

module.exports = TelephoneNumberField
