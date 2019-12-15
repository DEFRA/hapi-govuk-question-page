const TextField = require('./textfield')

class NamesField extends TextField {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.attributes.spellcheck = 'false'
    if (this.options.autocomplete) {
      viewModel.autocomplete = 'name'
    }
    return viewModel
  }
}

module.exports = NamesField
