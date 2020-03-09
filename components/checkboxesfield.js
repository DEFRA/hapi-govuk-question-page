const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class CheckboxesField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { options: { list: { type: listType, items: listItems = [] } = {} } = {} } = this
    this.listItems = listItems
    const listValues = listItems.map(listItem => listItem.value)
    this.listType = listType
    this.listValues = listValues
  }

  getFormSchemaKeys (config = {}) {
    const { name, listValues, listType, options: { required, filterable } = {} } = this
    const { [name]: { filter } = {} } = config

    let formSchema = joi.alternatives().prefs({ abortEarly: true })
    if (required === false) {
      formSchema = formSchema.allow('')
    } else {
      formSchema = formSchema.empty('').required()
    }

    if (!filterable) {
      const itemSchema = joi[listType]().valid(...listValues)
      const itemsSchema = joi.array().items(itemSchema)
      formSchema = formSchema.try(itemSchema, itemsSchema)
    }

    if (filterable) {
      let values = listValues
      if (filter && Array.isArray(filter)) {
        values = values.filter(value => filter.includes(value))
        values = values.length < 2 ? listValues : values
      }

      const itemSchema = joi[listType]().valid(...values)
      const itemsSchema = joi.array().items(itemSchema)
      formSchema = formSchema.try(itemSchema, itemsSchema)
    }

    const { titleForErrorText, nameForErrorText } = this.getTextForErrors(config)
    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`,
      'array.includes': `${titleForErrorText} must be from the list`,
      'alternatives.types': `${titleForErrorText} must be from the list`,
      'alternatives.match': `${titleForErrorText} must be from the list`
    })

    return { [name]: formSchema }
  }

  getDisplayStringFromState (state) {
    const { name, listItems = [] } = this

    if (name in state) {
      const value = state[name]

      if (value === null) {
        return ''
      }

      const checked = Array.isArray(value) ? value : [value]
      return listItems.filter(item => checked.find(check => check === item.value)).map(item => item.text).join(', ')
    } else {
      return ''
    }
  }

  getViewModel (config, formData, errors) {
    const { name, listItems = [], options: { filterable } } = this
    const { [name]: { filter } = {} } = config
    const viewModel = super.getViewModel(config, formData, errors)
    let formDataItems = []

    if (name in formData) {
      formDataItems = Array.isArray(formData[name])
        ? formData[name]
        : formData[name].split(',')
    }

    let items = listItems
    if (filterable && filter && Array.isArray(filter)) {
      items = items.filter(({ value }) => filter.includes(value))
      items = items.length < 2 ? listItems : items
    }

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: items.map(item => {
        // Do a loose string based check as state may or
        // may not match the item value types.
        const itemIsSelected = !!formDataItems.find(i => '' + item.value === i)
        return this.mapItemForViewModel(config, formData, errors, item, itemIsSelected)
      })
    })

    return viewModel
  }

  mapItemForViewModel (config, formData, errors, item, checked = false) {
    const { options: { bold } = {} } = this
    const { text, value, description, conditionalHtml } = item

    const itemModel = { text, value, checked }

    if (bold) {
      itemModel.label = { classes: 'govuk-label--s' }
    }

    if (description) {
      itemModel.hint = { html: description }
    }

    if (conditionalHtml) {
      itemModel.conditional = { html: conditionalHtml }
    }

    return itemModel
  }
}

module.exports = CheckboxesField
