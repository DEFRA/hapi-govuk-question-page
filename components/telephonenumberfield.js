const TextField = require('./textfield')

class TelephoneNumberField extends TextField {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)
    viewModel.type = 'tel'
    return viewModel
  }
}

module.exports = TelephoneNumberField
