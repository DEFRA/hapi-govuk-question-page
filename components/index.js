const joi = require('@hapi/joi')
const componentTypes = require('../component-types')
const nunjucks = require('nunjucks')
const path = require('path')

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

// An ES 6 class providing conditional reveal support for radio buttons (https://design-system.service.gov.uk/components/radios/)
// and checkboxes (https://design-system.service.gov.uk/components/checkboxes/)
class ConditionalFormComponent extends FormComponent {
  constructor (definition) {
    super(definition)
    const { options = {} } = this
    const { list = {} } = options
    const { items = [] } = list
    const values = items.map(item => item.value)
    Object.assign(this, { list, items, values })
    this.createConditionalComponents(definition)
  }

  addConditionalComponents (item, itemModel, formData, errors) {
    // The gov.uk design system Nunjucks examples for conditional reveal reference variables from macros. There does not appear to
    // to be a way to do this in JavaScript. As such, render the conditional components with Nunjucks before the main view is rendered.
    // The conditional html tag used by the gov.uk design system macro will reference HTML rarther than one or more additional
    // gov.uk design system macros.
    if (item.conditional) {
      itemModel.conditional = {
        html: nunjucks.render('conditional-components.html', { components: item.conditional.componentCollection.getViewModel(formData, errors) })
      }
    }
    return itemModel
  }

  getFormDataFromState (state) {
    const formData = super.getFormDataFromState(state)
    if (formData) {
      const itemsWithConditionalComponents = this.list.items.filter(item => item.conditional && item.conditional.components)
      itemsWithConditionalComponents.forEach(item => {
        const itemFormDataFromState = item.conditional.componentCollection.getFormDataFromState(state)
        if (itemFormDataFromState && Object.keys(itemFormDataFromState).length > 0) {
          Object.assign(formData, itemFormDataFromState)
        }
      })
    }
    return formData
  }

  getFormSchemaKeys () {
    return this.getSchemaKeys('form')
  }

  getStateFromValidForm (payload) {
    const state = super.getStateFromValidForm(payload)
    const itemsWithConditionalComponents = this.list.items.filter(item => item.conditional && item.conditional.components)

    const selectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(item => {
      if (payload[this.name] && Array.isArray(payload[this.name])) {
        return payload[this.name].find(nestedItem => item.value === nestedItem)
      } else {
        return item.value === payload[this.name]
      }
    })

    // Add selected form data associated with conditionally revealed content to the state.
    selectedItemsWithConditionalComponents.forEach(item => Object.assign(state, item.conditional.componentCollection.getStateFromValidForm(payload)))

    // Add null values to the state for unselected form data associated with conditionally revealed content.
    // This will allow changes in the visibility of onditionally revealed content to be reflected in state correctly.
    const unselectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(item => !selectedItemsWithConditionalComponents.includes(item))
    unselectedItemsWithConditionalComponents.forEach(item => {
      const stateFromValidForm = item.conditional.componentCollection.getStateFromValidForm(payload)
      Object.values(item.conditional.componentCollection.items).filter(conditionalItem => stateFromValidForm[conditionalItem.name]).forEach(key => {
        const conditionalItemToNull = key.name
        Object.assign(stateFromValidForm, { [conditionalItemToNull]: null })
      })
      Object.assign(state, stateFromValidForm)
    })
    return state
  }

  createConditionalComponents (def, model) {
    const filteredItems = this.list.items.filter(item => item.conditional && item.conditional.components)
    // Create a collection of conditional components that can be converted to a view model and rendered by Nunjucks
    // before primary view model rendering takes place.
    filteredItems.map(item => {
      item.conditional.componentCollection = new ComponentCollection(item.conditional.components, model)
    })
  }

  getSchemaKeys (schemaType) {
    const schemaName = `${schemaType}Schema`
    const schemaKeysFunctionName = `get${schemaType.substring(0, 1).toUpperCase()}${schemaType.substring(1)}SchemaKeys`
    const filteredItems = this.items.filter(item => item.conditional && item.conditional.componentCollection)
    const conditionalName = this.name
    const schemaKeys = { [conditionalName]: this[schemaName] }
    const schema = this[schemaName]
    // All conditional component values are submitted regardless of their visibilty.
    // As such create Joi validation rules such that:
    // a) When a conditional component is visible it is required.
    // b) When a conditional component is not visible it is optional.
    filteredItems.forEach(item => {
      const conditionalSchemaKeys = item.conditional.componentCollection[schemaKeysFunctionName]()
      // Iterate through the set of components handled by conditional reveal adding Joi validation rules
      // based on whether or not the component controlling the conditional reveal is selected.
      Object.keys(conditionalSchemaKeys).forEach(key => {
        Object.assign(schemaKeys, {
          [key]: joi.alternatives()
            .when(conditionalName, {
              is: item.value,
              then: conditionalSchemaKeys[key].required(),
              // If multiple checkboxes are selected their values will be held in an array. In this
              // case conditionally revealed content is required to be entered if the controlliing
              // checkbox value is a member of the array of selected checkbox values.
              otherwise: joi.alternatives()
                .when(conditionalName, {
                  is: joi.array().items(schema.only(item.value), joi.any()).required(),
                  then: conditionalSchemaKeys[key].required(),
                  otherwise: conditionalSchemaKeys[key].optional().allow('').allow(null)
                })
            })
        })
      })
    })
    return schemaKeys
  }
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

// Configure Nunjucks to allow rendering of content that is revealed conditionally.
nunjucks.configure([path.resolve(__dirname, '../views/components/'), path.resolve(__dirname, '../views/partials/'), path.resolve(__dirname, '../node_modules/govuk-frontend/components/')])
module.exports = { Component, FormComponent, ConditionalFormComponent, ComponentCollection }
