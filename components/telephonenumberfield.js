const { FormComponent } = require('.')
const helpers = require('./helpers')

class TelephoneNumberField extends FormComponent {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const { schema: { max } = {} } = this
    const viewModel = super.getViewModel(formData, errors)

    if (typeof max === 'number') {
      viewModel.attributes = {
        maxlength: max
      }
    }

    viewModel.type = 'tel'

    return viewModel
  }
}

module.exports = TelephoneNumberField
