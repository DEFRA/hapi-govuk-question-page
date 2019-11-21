const { FormComponent } = require('.')
const helpers = require('./helpers')

class TelephoneNumberField extends FormComponent {
  constructor (definition) {
    super(definition)
    const { options } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const schema = this.schema
    const viewModel = super.getViewModel(formData, errors)

    if (typeof schema.max === 'number') {
      viewModel.attributes = {
        maxlength: schema.max
      }
    }

    viewModel.type = 'tel'

    return viewModel
  }
}

module.exports = TelephoneNumberField
