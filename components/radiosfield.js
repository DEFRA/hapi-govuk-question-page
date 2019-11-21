const { ConditionalFormComponent } = require('.')
const helpers = require('./helpers')

class RadiosField extends ConditionalFormComponent {
  constructor (definition) {
    super(definition)

    const { list, options, values } = this
    const formSchema = helpers.buildFormSchema(list.type, this, options.required !== false).valid(...values)

    this.formSchema = formSchema
  }

  getDisplayStringFromState (state) {
    const { name, items } = this
    const value = state[name]
    const item = items.find(item => item.value === value)
    return item ? item.text : ''
  }

  getViewModel (formData, errors) {
    const { name, items, options } = this
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: items.map((item) => {
        const itemModel = {
          html: item.text,
          value: item.value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + item.value === '' + formData[name]
        }

        if (options.bold) {
          itemModel.label = {
            classes: 'govuk-label--s'
          }
        }

        if (item.description) {
          itemModel.hint = {
            html: item.description
          }
        }

        return super.addConditionalComponents(item, itemModel, formData, errors)
      })
    })

    return viewModel
  }
}

module.exports = RadiosField
