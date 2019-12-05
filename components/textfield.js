const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class TextField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, schema: { max, trim } = {}, options: { required } = {} } = this

    let schema = joi.string().prefs({ abortEarly: true }).label(titleForErrorText)
    if (max) {
      schema = schema.max(max)
    }
    if (trim !== false) {
      schema = schema.trim()
    }
    if (required === false) {
      schema = schema.allow('')
    } else {
      schema = schema.required()
    }
    schema = schema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'string.empty': `Enter ${nameForErrorText}`,
      'string.max': `${titleForErrorText} must be ${max} characters or fewer`
    })
    this.formSchema = schema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
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
