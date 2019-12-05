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

    const dateParts = datePartsText.map(datePartText => Number.parseInt(datePartText))
    const invalidEntry = dateParts.some(datePart => Number.isNaN(datePart))
    if (invalidEntry) {
      return helpers.error('date.base')
    }
    const parsedDateParts = getPartsFromDate(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]))
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

    const { titleForErrorText, nameForErrorText, options: { required } = {} } = this

    let schema = joi.object({ dummy: joi.any().default(1) }).default().custom(dateChecker(required))

    schema = schema.messages({
      'any.required': `Enter ${nameForErrorText}`,
      'date.format': `${titleForErrorText} must include a day, month and year`,
      'date.base': `Enter a real ${nameForErrorText}`
    })

    this.formSchema = schema
  }

  getFormSchemaKeys () {
    return {
      [this.name]: this.formSchema,
      [`${this.name}__day`]: joi.any(),
      [`${this.name}__month`]: joi.any(),
      [`${this.name}__year`]: joi.any()
    }
  }

  getFormDataFromState (state) {
    const name = this.name
    const value = state[name]
    return {
      [`${name}__day`]: value && value.getDate(),
      [`${name}__month`]: value && value.getMonth() + 1,
      [`${name}__year`]: value && value.getFullYear()
    }
  }

  getStateValueFromValidForm (payload) {
    // Use `moment` to parse the date as
    // opposed to the Date constructor.
    // `moment` will check that the individual date
    // parts together constitute a valid date.
    // E.g. 31 November is not a valid date
    const name = this.name
    return payload[`${name}__year`]
      ? moment([
        payload[`${name}__year`],
        payload[`${name}__month`] - 1,
        payload[`${name}__day`]
      ]).toDate()
      : null
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]
    return value instanceof Date
      ? moment(value).format('D MMMM YYYY')
      : ''
  }

  getViewModel (formData, errors) {
    const { name: componentName } = this
    const viewModel = super.getViewModel(formData, errors)

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
