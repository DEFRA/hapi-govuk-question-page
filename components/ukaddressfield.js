const { FormComponent, ComponentCollection } = require('.')

class UkAddressField extends FormComponent {
  constructor (definition) {
    super(definition)
    const { name, options: { required } = {} } = this

    const childrenList = [
      { type: 'TextField', name: 'premises', title: 'Premises', schema: { max: 100 }, options: { required } },
      { type: 'TextField', name: 'street', title: 'Street', schema: { max: 100, allow: '' }, options: { required: false } },
      { type: 'TextField', name: 'locality', title: 'Locality', schema: { max: 100, allow: '' }, options: { required: false } },
      { type: 'TextField', name: 'town', title: 'Town', schema: { max: 100 }, options: { required } },
      { type: 'TextField', name: 'postcode', title: 'Postcode', schema: { max: 10 }, options: { required } }
    ]

    // Modify the name to add a prefix and reuse
    // the children to create the formComponents
    childrenList.forEach(child => (child.name = `${name}__${child.name}`))

    const formChildren = new ComponentCollection(childrenList)

    this.formChildren = formChildren
  }

  getFormSchemaKeys () {
    return this.formChildren.getFormSchemaKeys()
  }

  getFormDataFromState (state) {
    const name = this.name
    const value = state[name]
    return {
      [`${name}__premises`]: value && value.premises,
      [`${name}__street`]: value && value.street,
      [`${name}__locality`]: value && value.locality,
      [`${name}__town`]: value && value.town,
      [`${name}__postcode`]: value && value.postcode
    }
  }

  getStateValueFromValidForm (payload) {
    // Use `moment` to parse the date as
    // opposed to the Date constructor.
    // `moment` will check that the individual date
    // parts together constitute a valid date.
    // E.g. 31 November is not a valid date
    const name = this.name
    return payload[`${name}__premises`] ? {
      premises: payload[`${name}__premises`],
      street: payload[`${name}__street`],
      locality: payload[`${name}__locality`],
      town: payload[`${name}__town`],
      postcode: payload[`${name}__postcode`]
    } : null
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]

    return value ? [
      value.premises,
      value.street,
      value.locality,
      value.town,
      value.postcode
    ].filter(p => {
      return !!p
    }).join(', ') : ''
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      children: this.formChildren.getViewModel(formData, errors)
    })

    return viewModel
  }
}

module.exports = UkAddressField
