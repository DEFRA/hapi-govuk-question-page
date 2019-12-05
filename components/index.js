const joi = require('@hapi/joi')
const componentTypes = require('../component-types')

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

let Types = null
function getType (name) {
  if (Types === null) {
    Types = {}
    componentTypes.forEach(componentType => {
      Types[componentType.name] = require(`./${componentType.name.toLowerCase()}`)
    })
  }

  return Types[name]
}

class ComponentCollection {
  constructor (componentDefinitions = []) {
    const components = componentDefinitions.map(def => {
      const Type = getType(def.type)
      return new Type(def)
    })

    const formComponents = components.filter(component => component.isFormComponent)

    this.components = components
    this.formComponents = formComponents
    this.formSchema = joi.object().keys(this.getFormSchemaKeys()).required()
  }

  getFormSchemaKeys () {
    const keys = {}

    this.formComponents.forEach(component => {
      Object.assign(keys, component.getFormSchemaKeys())
    })

    return keys
  }

  getFormDataFromState (state) {
    const formData = {}

    this.formComponents.forEach(component => {
      Object.assign(formData, component.getFormDataFromState(state))
    })

    return formData
  }

  getStateFromValidForm (payload) {
    const state = {}

    this.formComponents.forEach(component => {
      Object.assign(state, component.getStateFromValidForm(payload))
    })

    return state
  }

  getViewModel (formData, errors) {
    return this.components.map(component => {
      return {
        type: component.type,
        isFormComponent: component.isFormComponent,
        model: component.getViewModel(formData, errors)
      }
    })
  }
}

module.exports = { Component, FormComponent, ComponentCollection }
