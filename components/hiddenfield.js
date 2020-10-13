const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class HiddenField extends FormComponent {
  constructor(definition) {
    super(definition)
    let schema = joi.any()
    this.formSchema = schema
  }

  getFormSchemaKeys(config) {
    const { name } = this
    let { formSchema } = this
    return { [name]: formSchema }
  }

  getViewModel(config, formData, errors) {
    const { value } = this
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.value = this.value
    return viewModel
  }
}

module.exports = HiddenField