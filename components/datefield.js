const moment = require('moment')
const { FormComponent } = require('.')
const helpers = require('./helpers')

class DateField extends FormComponent {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'date', this)
  }

  getFormValueFromState (state) {
    const name = this.name
    const value = state[name]
    return value instanceof Date
      ? moment(value).format('YYYY-MM-DD')
      : value
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]

    return value instanceof Date
      ? moment(value).format('D MMMM YYYY')
      : ''
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)
    viewModel.type = 'date'
    return viewModel
  }
}

module.exports = DateField
