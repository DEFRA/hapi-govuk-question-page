const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class TextField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { schema: { max, maxwords, trim } = {}, options: { required } = {} } = this

    let formSchema = joi.string().prefs({ abortEarly: true })
    if (trim !== false) {
      formSchema = formSchema.trim()
    }
    if (maxwords) {
      const wordLimitRegex = new RegExp(`^(\\w*\\W*){0,${maxwords}}$`)
      formSchema = formSchema.pattern(wordLimitRegex, 'words')
    } else if (max) {
      formSchema = formSchema.max(max)
    }
    if (required === false) {
      formSchema = formSchema.allow('')
    } else {
      formSchema = formSchema.required()
    }
    this.formSchema = formSchema
  }

  getFormSchemaKeys (config) {
    const { name, schema: { max, maxwords } = {} } = this
    const { titleForErrorText, nameForErrorText } = this.getTextForErrors(config)
    let { formSchema } = this
    formSchema = formSchema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'string.empty': `Enter ${nameForErrorText}`,
      'string.max': `${titleForErrorText} must be ${max} characters or fewer`,
      'string.pattern.name': `${titleForErrorText} must be ${maxwords} words or fewer`
    })

    return { [name]: formSchema }
  }

  getViewModel (config, formData, errors) {
    const { schema: { max, maxwords } = {}, prefix, suffix } = this
    const viewModel = super.getViewModel(config, formData, errors)
    Object.assign(viewModel, { prefix, suffix })
    if (!maxwords && typeof max === 'number') {
      viewModel.attributes.maxlength = max
    }
    return viewModel
  }
}

module.exports = TextField
