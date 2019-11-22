const { FormComponent } = require('.')
const helpers = require('./helpers')

class TextField extends FormComponent {
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

    return viewModel
  }
}

module.exports = TextField
