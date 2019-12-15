const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class NumberField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, schema: { integer, min, max, greater, less } = {}, options: { required } = {} } = this

    let schema = joi.any().label(titleForErrorText)
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

    schema = schema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'string.empty': `Enter ${nameForErrorText}`,
      'number.base': `${titleForErrorText} must be a number`,
      'number.integer': `${titleForErrorText} must be a whole number`,
      'number.min': `${titleForErrorText} must be ${min} or more`,
      'number.max': `${titleForErrorText} must be ${max} or ${integer ? 'fewer' : 'less'}`,
      'number.greater': `${titleForErrorText} must be more than ${greater}`,
      'number.less': `${titleForErrorText} must be less than ${less}`
    })

    this.formSchema = schema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.type = 'number'
    return viewModel
  }
}

module.exports = NumberField
