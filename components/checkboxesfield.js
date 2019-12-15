const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class CheckboxesField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, options: { required, list: { type, items = [] } = {} } = {} } = this
    this.items = items

    const values = items.map(item => item.value)
    const itemSchema = joi[type]().valid(...values)
    const itemsSchema = joi.array().items(itemSchema)

    let formSchema = joi.alternatives([itemSchema, itemsSchema]).prefs({ abortEarly: true }).label(titleForErrorText)
    if (required === false) {
      formSchema = formSchema.allow('')
    } else {
      formSchema = formSchema.empty('').required()
    }

    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`,
      'array.includes': `${titleForErrorText} must be from the list`,
      'alternatives.types': `${titleForErrorText} must be from the list`,
      'alternatives.match': `${titleForErrorText} must be from the list`
    })
    this.formSchema = formSchema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
  }

  getDisplayStringFromState (state) {
    const { name, items = [] } = this

    if (name in state) {
      const value = state[name]

      if (value === null) {
        return ''
      }

      const checked = Array.isArray(value) ? value : [value]
      return items.filter(item => checked.find(check => check === item.value)).map(item => item.text).join(', ')
    } else {
      return ''
    }
  }

  getViewModel (config, formData, errors) {
    const { name, items = [] } = this
    const viewModel = super.getViewModel(config, formData, errors)
    let formDataItems = []

    if (name in formData) {
      formDataItems = Array.isArray(formData[name])
        ? formData[name]
        : formData[name].split(',')
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
