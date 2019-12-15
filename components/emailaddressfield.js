const TextField = require('./textfield')

class EmailAddressField extends TextField {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }

    this.formSchema = this.formSchema.email({ tlds: false }).messages({
      'string.email': `Enter ${this.nameForErrorText} in the correct format`
    })
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.type = 'email'
    viewModel.attributes.spellcheck = 'false'
    if (this.options.autocomplete) {
      viewModel.autocomplete = 'email'
    }
    return viewModel
  }
}

module.exports = EmailAddressField
