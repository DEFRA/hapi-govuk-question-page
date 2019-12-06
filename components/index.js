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
        [name]: this.getFormValueFromState(state)
      }
    }
  }

  getFormValueFromState (state) {
    const name = this.name

    if (name in state) {
      return state[name] === null ? '' : state[name].toString()
    }
  }

  getStateFromValidForm (payload) {
    const name = this.name

    return {
      [name]: this.getStateValueFromValidForm(payload)
    }
  }

  getStateValueFromValidForm (payload) {
    const name = this.name

    return (name in payload && payload[name] !== '')
      ? payload[name]
      : null
  }

  getViewModel (formData, errors) {
    const { name, title, hint, options = {} } = this
    const isOptional = options.required === false
    const label = title + (isOptional ? ' (optional)' : '')

    const model = {
      label: {
        text: label,
        classes: 'govuk-label--s'
      },
      id: name,
      name,
      value: formData[name]
    }

    if (hint) {
      model.hint = {
        html: hint
      }
    }

    if (options.classes) {
      model.classes = options.classes
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

  getFormSchemaKeys () { return { [this.name]: joi.any() } }
  getDisplayStringFromState (state) { return state[this.name] }
}

module.exports = { Component, FormComponent }
