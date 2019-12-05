const TextField = require('./textfield')

class MultilineTextField extends TextField {
  getViewModel (formData, errors) {
    const { options: { rows } = {} } = this
    const viewModel = super.getViewModel(formData, errors)

    if (rows) {
      viewModel.rows = rows
    }

    return viewModel
  }
}

module.exports = MultilineTextField
