const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class SelectField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, options: { required, filterable, list: { type: listType, items: listItems = [] } = {} } = {} } = this
    this.listItems = listItems
    const listValues = listItems.map(listItem => listItem.value)
    this.listType = listType
    this.listValues = listValues

    let formSchema = joi[listType]().label(titleForErrorText)
    if (required === false) {
      formSchema = formSchema.allow('')
    } else {
      formSchema = formSchema.empty('').required()
    }

    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`
    })

    if (!filterable) {
      formSchema = formSchema.valid(...listValues)
    }

    this.formSchema = formSchema
  }

  getFormSchemaKeys (config = {}) {
    const { name, listValues, options: { filterable } = {} } = this
    const { [name]: { filter } = {} } = config

    let schema = this.formSchema
    if (filterable) {
      let values = listValues
      if (filter && Array.isArray(filter)) {
        values = values.filter(value => filter.includes(value))
        values = values.length < 2 ? listValues : values
      }
      schema = schema.valid(...values)
    }

    return { [name]: schema }
  }

  getDisplayStringFromState (state) {
    const { name, listItems } = this
    const value = state[name]
    const item = listItems.find(item => item.value === value)
    return item ? item.text : ''
  }

  getViewModel (config, formData, errors) {
    const { name, options: { filterable } = {}, listItems = [] } = this
    const { [name]: { filter } = {} } = config
    const viewModel = super.getViewModel(config, formData, errors)

    let items = listItems
    if (filterable && filter && Array.isArray(filter)) {
      items = items.filter(({ value }) => filter.includes(value))
      items = items.length < 2 ? listItems : items
    }

    Object.assign(viewModel, {
      items: [{ text: '' }].concat(items.map(item => {
        return {
          text: item.text,
          value: item.value,
          // Do a loose check as state may or
          // may not match the item value types
          selected: '' + item.value === '' + formData[name]
        }
      }))
    })

    return viewModel
  }
}

module.exports = SelectField
