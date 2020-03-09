const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class RadiosField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { options: { filterable, list: { type: listType, items: listItems = [] } = {} } = {} } = this
    this.listItems = listItems
    const listValues = listItems.map(listItem => listItem.value)
    this.listType = listType
    this.listValues = listValues

    let formSchema = joi[listType]().empty('').required()

    if (!filterable) {
      formSchema = formSchema.valid(...listValues)
    }

    this.formSchema = formSchema
  }

  getFormSchemaKeys (config = {}) {
    const { name, listValues, options: { filterable } = {} } = this
    const { titleForErrorText, nameForErrorText } = this.getTextForErrors(config)
    let { formSchema } = this
    const { [name]: { filter } = {} } = config

    if (filterable) {
      let values = listValues
      if (filter && Array.isArray(filter)) {
        values = values.filter(value => filter.includes(value))
        values = values.length < 2 ? listValues : values
      }
      formSchema = formSchema.valid(...values)
    }

    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`
    })

    return { [name]: formSchema }
  }

  getDisplayStringFromState (state) {
    const { name, listItems } = this
    const value = state[name]
    const item = listItems.find(item => item.value === value)
    return item ? item.text : ''
  }

  getViewModel (config, formData, errors) {
    const { name, options: { filterable, bold } = {}, listItems = [] } = this
    const { [name]: { filter } = {} } = config
    const viewModel = super.getViewModel(config, formData, errors)

    let items = listItems
    if (filterable && filter && Array.isArray(filter)) {
      items = items.filter(({ value }) => filter.includes(value))
      items = items.length < 2 ? listItems : items
    }

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: items.map(({ text, value, description, conditionalHtml }) => {
        const itemModel = {
          text,
          value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + value === '' + formData[name]
        }

        if (bold) {
          itemModel.label = {
            classes: 'govuk-label--s'
          }
        }

        if (description) {
          itemModel.hint = {
            html: description
          }
        }

        if (conditionalHtml) {
          itemModel.conditional = {
            html: conditionalHtml
          }
        }

        return itemModel
      })
    })

    return viewModel
  }
}

module.exports = RadiosField
