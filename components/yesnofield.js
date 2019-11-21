const { FormComponent } = require('.')
const helpers = require('./helpers')

class YesNoField extends FormComponent {
  constructor (definition) {
    super(definition)

    const { options } = this

    if (!options.classes) {
      options.classes = 'govuk-radios--inline'
    }

    const items = [{ text: 'Yes', value: true }, { text: 'No', value: false }]
    const list = { type: 'boolean', items }
    const values = items.map(item => item.value)
    const formSchema = helpers.buildFormSchema(list.type, this, options.required !== false).valid(...values)

    this.list = list
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

  getViewModel (formData, errors) {
    const { name, items } = this
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: items.map(item => {
        return {
          text: item.text,
          value: item.value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + item.value === '' + formData[name]
        }
      })
    })

    return viewModel
  }
}

module.exports = YesNoField
