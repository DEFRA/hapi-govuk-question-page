const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class HiddenField extends FormComponent {
  constructor (definition) {
    super(definition)
    const schema = joi.any()
    this.formSchema = schema
  }

  getFormSchemaKeys () {
    const { name } = this
    const { formSchema } = this
    return { [name]: formSchema }
  }

  getViewModel (config, formData, errors) {
    const { value } = this
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.value = value
    return viewModel
  }
}

module.exports = HiddenField
