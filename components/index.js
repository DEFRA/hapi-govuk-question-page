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
  constructor (items = []) {
    const itemTypes = items.map(def => {
      const Type = getType(def.type)
      return new Type(def)
    })

    const formItems = itemTypes.filter(component => component.isFormComponent)

    this.items = itemTypes
    this.formItems = formItems
    this.formSchema = joi.object().keys(this.getFormSchemaKeys()).required()
  }

  getFormSchemaKeys () {
    const keys = {}

    this.formItems.forEach(item => {
      Object.assign(keys, item.getFormSchemaKeys())
    })

    return keys
  }

  getFormDataFromState (state) {
    const formData = {}

    this.formItems.forEach(item => {
      Object.assign(formData, item.getFormDataFromState(state))
    })

    return formData
  }

  getStateFromValidForm (payload) {
    const state = {}

    this.formItems.forEach(item => {
      Object.assign(state, item.getStateFromValidForm(payload))
    })

    return state
  }

  getViewModel (formData, errors) {
    return this.items.map(item => {
      return {
        type: item.type,
        isFormComponent: item.isFormComponent,
        model: item.getViewModel(formData, errors)
      }
    })
  }
}

module.exports = { Component, FormComponent, ComponentCollection }
