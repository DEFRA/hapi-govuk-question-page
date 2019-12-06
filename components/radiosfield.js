const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class RadiosField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, options: { list: { type, items = [] } = {} } = {} } = this
    this.items = items

    const values = items.map(item => item.value)

    let formSchema = joi[type]().empty('').required().label(titleForErrorText)
    formSchema = formSchema.valid(...values)
    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`
    })

    this.formSchema = formSchema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
  }

  getDisplayStringFromState (state) {
    const { name, items } = this
    const value = state[name]
    const item = items.find(item => item.value === value)
    return item ? item.text : ''
  }

  getViewModel (formData, errors) {
    const { name, options: { bold } = {}, items = [] } = this
    const viewModel = super.getViewModel(formData, errors)

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
