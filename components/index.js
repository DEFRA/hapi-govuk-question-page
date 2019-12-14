const joi = require('@hapi/joi')

class Component {
  constructor (definition) {
    Object.assign(this, definition)
  }

  getViewModel () { return {} }
}

class FormComponent extends Component {
  constructor (definition) {
    super(definition)
    this.isFormComponent = true

    const { name, title, titleForError } = this
    this.titleForErrorText = titleForError || title || name.charAt(0).toUpperCase() + name.slice(1)
    this.nameForErrorText = this.titleForErrorText.charAt(0).toLowerCase() + this.titleForErrorText.slice(1)
  }

  getFormDataFromState (state) {
    const name = this.name

    if (name in state) {
      return {
        [name]: state[name] === null ? '' : state[name].toString()
      }
    }
  }

  getStateFromValidForm (validatedFormData) {
    const name = this.name

    return {
      [name]: (name in validatedFormData && validatedFormData[name] !== '')
        ? validatedFormData[name]
        : null
    }
  }

  getViewModel (formData, errors) {
    const { name, title, hint, options: { classes, required = true } = {} } = this
    const isOptional = required === false
    const label = (title || name) + (isOptional ? ' (optional)' : '')

    const model = {
      id: name,
      name,
      classes,
      attributes: {},
      label: {
        text: label,
        classes: 'govuk-label--s'
      },
      value: formData[name]
    }

    if (hint) {
      model.hint = {
        html: hint
      }
    }

    if (errors) {
      errors.errorList.forEach(err => {
        if (err.name === name) {
          model.errorMessage = {
            text: err.text
          }
        }
      })
    }

    return model
  }

  getFormSchemaKeys () {
    return { [this.name]: joi.any() }
  }

  getDisplayStringFromState (state) {
    const name = this.name
    if (name in state) {
      return '' + state[this.name]
    } else {
      return ''
    }
  }
}

module.exports = { Component, FormComponent }
