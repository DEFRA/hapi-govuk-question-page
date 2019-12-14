const MultilineTextField = require('./multilinetextfield')

class CharacterCountField extends MultilineTextField {
  getViewModel (formData, errors) {
    const { options: { threshold } = {}, schema: { max, maxwords } = {} } = this
    const viewModel = super.getViewModel(formData, errors)

    delete viewModel.attributes.maxlength
    if (maxwords) {
      viewModel.maxwords = maxwords
    } else {
      viewModel.maxlength = max
    }
    if (threshold) {
      viewModel.threshold = threshold
    }

    return viewModel
  }
}

module.exports = CharacterCountField
