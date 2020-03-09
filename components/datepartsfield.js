const joi = require('@hapi/joi')
const moment = require('moment')
const { FormComponent } = require('.')

const PARTS = ['Day', 'Month', 'Year']
const SUFFIXES = PARTS.map(part => `__${part.toLowerCase()}`)
const SIZES = [2, 2, 4]

const getPartsFromDate = (date) => {
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
}

const dateChecker = (required) => {
  return (value, helpers) => {
    const parent = helpers.state.ancestors[0]
    const dateFieldName = helpers.state.path[helpers.state.path.length - 1]
    const datePartsText = SUFFIXES.map(suffix => (parent[`${dateFieldName}${suffix}`] || '').trim())

    const someEntered = datePartsText.some(datePartText => datePartText)
    if (!someEntered) {
      if (required === false) {
        return value
      } else {
        return helpers.error('any.required')
      }
    }

    const allEntered = datePartsText.every(datePartText => datePartText)
    if (!allEntered) {
      return helpers.error('date.format')
    }

    const dateParts = datePartsText.map(datePartText => Number.parseFloat(datePartText))
    const invalidEntry = dateParts.some(datePart => Number.isNaN(datePart) || !Number.isSafeInteger(datePart))
    if (invalidEntry) {
      return helpers.error('date.base')
    }
    const parsedDateParts = getPartsFromDate(new Date(dateParts[2], dateParts[1] - 1, dateParts[0]))
    const notMatched = dateParts.some((datePart, index) => datePart !== parsedDateParts[index])
    if (notMatched) {
      return helpers.error('date.base')
    }

    return value
  }
}

class DatePartsField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { options: { required } = {} } = this

    this.formSchema = joi.object({ dummy: joi.any().default(1) }).default().custom(dateChecker(required))
  }

  getFormSchemaKeys (config) {
    const { titleForErrorText, nameForErrorText } = this.getTextForErrors(config)
    let { formSchema } = this
    formSchema = formSchema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'date.format': `${titleForErrorText} must include a day, month and year`,
      'date.base': `Enter a real ${nameForErrorText}`
    })
    return {
      [this.name]: formSchema,
      [`${this.name}__day`]: joi.any(),
      [`${this.name}__month`]: joi.any(),
      [`${this.name}__year`]: joi.any()
    }
  }

  getFormDataFromState (state) {
    const name = this.name
    const value = state[name]
    return {
      [`${name}__day`]: value ? '' + value.getDate() : '',
      [`${name}__month`]: value ? '' + (value.getMonth() + 1) : '',
      [`${name}__year`]: value ? '' + value.getFullYear() : ''
    }
  }

  getStateFromValidForm (validatedFormData) {
    // Use `moment` to parse the date as
    // opposed to the Date constructor.
    // `moment` will check that the individual date
    // parts together constitute a valid date.
    // E.g. 31 November is not a valid date
    const name = this.name
    const value = validatedFormData[`${name}__year`]
      ? moment([
        validatedFormData[`${name}__year`],
        validatedFormData[`${name}__month`] - 1,
        validatedFormData[`${name}__day`]
      ]).toDate()
      : null
    return {
      [name]: value
    }
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]
    return value instanceof Date
      ? moment(value).format('D MMMM YYYY')
      : ''
  }

  getViewModel (config, formData, errors) {
    const { name: componentName } = this
    const viewModel = super.getViewModel(config, formData, errors)

    viewModel.items = PARTS.map((label, index) => {
      const name = `${componentName}${SUFFIXES[index]}`
      const classes = `govuk-input--width-${SIZES[index]}${viewModel.errorMessage ? ' govuk-input--error' : ''}`
      return { label, id: name, name, classes, value: formData[name] }
    })

    viewModel.fieldset = {
      legend: viewModel.label
    }

    return viewModel
  }
}

module.exports = DatePartsField
