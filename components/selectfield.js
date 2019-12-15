const joi = require('@hapi/joi')
const { FormComponent } = require('.')

class SelectField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { titleForErrorText, nameForErrorText, options: { required, list: { items = [] } = {} } = {} } = this
    const values = items.map(item => '' + item.value)

    let formSchema = joi.string().label(titleForErrorText)
    if (required === false) {
      formSchema = formSchema.allow('')
    } else {
      formSchema = formSchema.empty('').required()
    }
    formSchema = formSchema.valid(...values)
    formSchema = formSchema.messages({
      'any.required': `Select ${nameForErrorText}`,
      'string.empty': `Select ${nameForErrorText}`,
      'any.only': `${titleForErrorText} must be from the list`
    })

    this.items = items
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

  getViewModel (config, formData, errors) {
    const { name, items } = this
    const viewModel = super.getViewModel(config, formData, errors)

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
