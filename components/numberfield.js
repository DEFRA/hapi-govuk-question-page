const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class NumberField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { schema: { integer, min, max, greater, less } = {}, options: { required } = {} } = this

    let schema = joi.any()
    if (required === false) {
      schema = schema.allow('')
    } else {
      schema = schema.empty('').required()
    }

    let numberSchema = joi.number()
    if (integer) {
      numberSchema = numberSchema.integer()
    }
    if (min) {
      numberSchema = numberSchema.min(min)
    }
    if (max) {
      numberSchema = numberSchema.max(max)
    }
    if (greater) {
      numberSchema = numberSchema.greater(greater)
    }
    if (less) {
      numberSchema = numberSchema.less(less)
    }

    schema = schema.when({
      is: joi.any().required(),
      then: numberSchema
    })

    this.formSchema = schema
  }

  getFormSchemaKeys (config) {
    const { name, schema: { integer, min, max, greater, less } = {} } = this
    const { titleForErrorText, nameForErrorText } = this.getTextForErrors(config)
    let { formSchema } = this
    formSchema = formSchema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'string.empty': `Enter ${nameForErrorText}`,
      'number.base': `${titleForErrorText} must be a number`,
      'number.integer': `${titleForErrorText} must be a whole number`,
      'number.min': `${titleForErrorText} must be ${min} or more`,
      'number.max': `${titleForErrorText} must be ${max} or ${integer ? 'fewer' : 'less'}`,
      'number.greater': `${titleForErrorText} must be more than ${greater}`,
      'number.less': `${titleForErrorText} must be less than ${less}`
    })

    return { [name]: formSchema }
  }

  getViewModel (config, formData, errors) {
    const { options: { prefix, suffix } = {} } = this
    const viewModel = super.getViewModel(config, formData, errors)
    Object.assign(viewModel, { prefix, suffix })
    viewModel.type = 'number'
    return viewModel
  }
}

module.exports = NumberField
