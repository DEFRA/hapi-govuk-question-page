const { FormComponent } = require('.')
const helpers = require('./helpers')

class YesNoField extends FormComponent {
  constructor (definition) {
    super(definition)

    const options = this.options = this.options || {}
    if (!options.classes) {
      options.classes = 'govuk-radios--inline'
    }
    const { yesFirst = true } = options

    const [yes, no] = [{ text: 'Yes', value: true }, { text: 'No', value: false }]

    const items = yesFirst ? [yes, no] : [no, yes]
    const list = { type: 'boolean', items }
    const values = items.map(item => item.value)
    const formSchema = helpers.buildFormSchema(list.type, this, options.required !== false).valid(...values)

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
      items: items.map(({ text, value }) => {
        return {
          text: text,
          value: value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + value === '' + formData[name]
        }
      })
    })

    return viewModel
  }
}

module.exports = YesNoField
