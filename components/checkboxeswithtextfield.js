const joi = require('@hapi/joi')
const CheckboxesField = require('./checkboxesfield')

class CheckboxesWithTextField extends CheckboxesField {
  getFormSchemaKeys (config) {
    const formSchemaKeys = super.getFormSchemaKeys(config)

    const textboxSchemas = this.listItems.filter(({ conditionalTextField }) => conditionalTextField)
      .reduce((schemas, { value, conditionalTextField: { name, title, titleForError, schema: { max, trim } = {} } }) => {
        const titleForErrorText = titleForError || title || name.charAt(0).toUpperCase() + name.slice(1)
        const nameForErrorText = titleForErrorText.charAt(0).toLowerCase() + titleForErrorText.slice(1)

        let schema = joi.string().label(titleForErrorText)
        if (max) {
          schema = schema.max(max)
        }
        if (trim !== false) {
          schema = schema.trim()
        }

        schema = schema.when(this.name, {
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

        schema = schema.messages({
          'any.required': `Enter ${nameForErrorText}`,
          'string.empty': `Enter ${nameForErrorText}`
        })

        schemas[name] = schema
        return schemas
      }, {})

    Object.assign(formSchemaKeys, textboxSchemas)

    return formSchemaKeys
  }

  mapItemForViewModel (config, formData, errors, item, checked) {
    const itemModel = super.mapItemForViewModel(config, formData, errors, item, checked)
    if (item.conditionalTextField) {
      const { name, title, hint, schema: { max } = {} } = item.conditionalTextField
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

    const textFieldsFormData = this.listItems.reduce((acc, { conditionalTextField: { name } = {} }) => {
      if (name) {
        acc[name] = state[name] || ''
      }
      return acc
    }, {})

    Object.assign(formData, textFieldsFormData)

    return formData
  }

  getStateFromValidForm (validatedFormData) {
    const state = super.getStateFromValidForm(validatedFormData)

    const checkBoxesValue = state[this.name] || []
    const checked = Array.isArray(checkBoxesValue) ? checkBoxesValue : [checkBoxesValue]

    const textFieldsState = this.listItems.reduce((acc, { value, conditionalTextField: { name } = {} }) => {
      if (name) {
        acc[name] = (checked.includes(value) && name in validatedFormData && validatedFormData[name] !== '') ? validatedFormData[name] : null
      }
      return acc
    }, {})

    Object.assign(state, textFieldsState)

    return state
  }
}

module.exports = CheckboxesWithTextField
