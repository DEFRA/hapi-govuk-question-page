const joi = require('@hapi/joi')
const TextField = require('./textfield')

class HiddenField extends TextField {
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
    viewModel.type = 'hidden'
    viewModel.value = this.value
    return viewModel
  }
}

module.exports = HiddenField