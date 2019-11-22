const { FormComponent } = require('.')
const helpers = require('./helpers')

class TimeField extends FormComponent {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-4'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)

    viewModel.type = 'time'
    return viewModel
  }
}

module.exports = TimeField
