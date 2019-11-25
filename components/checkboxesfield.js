const joi = require('@hapi/joi')
const { FormComponent } = require('.')
const helpers = require('./helpers')

class CheckboxesField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { options: { required, list: { type, items = [] } = {} } = {} } = this
    this.items = items

    const values = items.map(item => item.value)
    const itemSchema = joi[type]().valid(...values)
    const itemsSchema = joi.array().items(itemSchema)
    const alternatives = joi.alternatives([itemSchema, itemsSchema])
    this.formSchema = helpers.buildFormSchema(alternatives, this, required !== false)
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
      return checked.map(check => items.find(item => item.value === check).text).join(', ')
    }
  }

  getViewModel (formData, errors) {
    const { name, items = [] } = this
    const viewModel = super.getViewModel(formData, errors)
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
        return this.mapItemForViewModel(formData, errors, item, itemIsSelected)
      })
    })

    return viewModel
  }

  mapItemForViewModel (formData, errors, item, checked = false) {
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
