const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class TextField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, schema: { max, maxwords, trim } = {}, options: { required } = {} } = this

    let schema = joi.string().prefs({ abortEarly: true }).label(titleForErrorText)
    if (trim !== false) {
      schema = schema.trim()
    }
    if (maxwords) {
      const wordLimitRegex = new RegExp(`^(\\w*\\W*){0,${maxwords}}$`)
      schema = schema.pattern(wordLimitRegex, 'words')
    } else if (max) {
      schema = schema.max(max)
    }
    if (required === false) {
      schema = schema.allow('')
    } else {
      schema = schema.required()
    }
    schema = schema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'string.empty': `Enter ${nameForErrorText}`,
      'string.max': `${titleForErrorText} must be ${max} characters or fewer`,
      'string.pattern.name': `${titleForErrorText} must be ${maxwords} words or fewer`
    })
    this.formSchema = schema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
  }

  getViewModel (config, formData, errors) {
    const { schema: { max, maxwords } = {} } = this
    const viewModel = super.getViewModel(config, formData, errors)

    if (!maxwords && typeof max === 'number') {
      viewModel.attributes.maxlength = max
    }

    return viewModel
  }
}

module.exports = TextField
