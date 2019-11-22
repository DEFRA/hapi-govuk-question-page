const { FormComponent } = require('.')
const helpers = require('./helpers')

class MultilineTextField extends FormComponent {
  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const { schema: { max } = {}, options: { rows } = {} } = this
    const viewModel = super.getViewModel(formData, errors)

    if (typeof max === 'number') {
      viewModel.attributes = {
        maxlength: max
      }
    }

    if (rows) {
      viewModel.rows = rows
    }

    return viewModel
  }
}

module.exports = MultilineTextField
