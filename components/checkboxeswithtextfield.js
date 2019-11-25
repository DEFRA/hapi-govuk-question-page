const joi = require('@hapi/joi')
const CheckboxesField = require('./checkboxesfield')
// const helpers = require('./helpers')

class CheckboxesWithTextField extends CheckboxesField {
  constructor (definition) {
    super(definition)

    const schema = this.formSchema
    console.log(schema)

    const textboxSchemas = this.items.filter(({ conditionalTextField }) => conditionalTextField).reduce((acc, { value, conditionalTextField: { name, title } }) => {
      acc[name] = joi.string().label(title)
        .when(this.name, {
          is: joi.any().required(),
          then: joi.string().when(this.name, {
            switch: [{
              is: value,
              then: joi.string().empty('').required()
            }, {
              is: joi.array().has(value),
              then: joi.string().empty('').required(),
              otherwise: joi.string().optional().allow('', null)
            }]
          }),
          otherwise: joi.string().optional().allow('', null)
        })
      return acc
    }, {})

    this.textboxSchemas = textboxSchemas
  }

  getFormSchemaKeys () {
    const formSchemaKeys = super.getFormSchemaKeys()
    Object.assign(formSchemaKeys, this.textboxSchemas)
    return formSchemaKeys
  }

  mapItemForViewModel (formData, errors, item, checked) {
    const itemModel = super.mapItemForViewModel(formData, errors, item, checked)
    if (item.conditionalTextField) {
      const { name, title, hint, max } = item.conditionalTextField
      const label = title || item.text

      const conditionalInputModel = {
        label: { text: label },
        id: name,
        name,
        classes: 'govuk-!-width-one-third',
        value: formData[name]
      }

      if (hint) {
        conditionalInputModel.hint = { html: hint }
      }

      if (typeof max === 'number') {
        conditionalInputModel.attributes = { maxlength: max }
      }

      if (errors) {
        const error = errors.errorList.find(err => err.name === name)
        if (error) {
          conditionalInputModel.errorMessage = { text: error.text }
        }
      }

      itemModel.conditional = { input: conditionalInputModel }
    }

    return itemModel
  }

  getFormDataFromState (state) {
    const formData = super.getFormDataFromState(state) || {}

    const textFieldsFormData = this.items.reduce((acc, { conditionalTextField: { name } = {} }) => {
      if (name) {
        acc[name] = state[name] || ''
      }
      return acc
    }, {})

    Object.assign(formData, textFieldsFormData)

    return formData
  }

  getStateFromValidForm (payload) {
    const state = super.getStateFromValidForm(payload) || {}

    const checkBoxesValue = state[this.name] || []
    const checked = Array.isArray(checkBoxesValue) ? checkBoxesValue : [checkBoxesValue]

    const textFieldsState = this.items.reduce((acc, { value, conditionalTextField: { name } = {} }) => {
      if (name) {
        acc[name] = (checked.includes(value) && name in payload && payload[name] !== '') ? payload[name] : null
      }
      return acc
    }, {})

    Object.assign(state, textFieldsState)

    return state
  }
}

module.exports = CheckboxesWithTextField
