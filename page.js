const joi = require('@hapi/joi')
const componentTypesList = require('./component-types')
const componentTypes = componentTypesList.reduce((acc, { name }) => {
  acc[name] = require(`./components/${name.toLowerCase()}`)
  return acc
}, {})

const VIEW_NAME = 'index'
const ERROR_SUMMARY_TITLE = 'Fix the following errors'
const VALIDATION_OPTIONS = { abortEarly: false }

class Page {
  constructor (pageDef) {
    const { title, sectionTitle, hasNext = true } = pageDef
    this.title = title
    this.sectionTitle = sectionTitle
    this.hasNext = hasNext

    const components = pageDef.components.map(def => new componentTypes[def.type](def))
    const formComponents = components.filter(component => component.isFormComponent)

    // Components collection
    this.components = components
    this.formComponents = formComponents
    this.hasFormComponents = !!formComponents.length
    this.hasSingleFormComponentFirst = formComponents.length === 1 && formComponents[0] === components[0]

    // Schema
    const formSchemaKeys = formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getFormSchemaKeys())
      return acc
    }, {})
    this.formSchema = joi.object().keys(formSchemaKeys).required()
  }

  getViewModel (formData, errors) {
    let showTitle = true
    let pageTitle = this.title
    const sectionTitle = this.sectionTitle
    const useForm = this.hasNext || this.hasFormComponents
    const components = this.components.map(component => ({ type: component.type, isFormComponent: component.isFormComponent, model: component.getViewModel(formData, errors) }))

    if (this.hasSingleFormComponentFirst) {
      const label = components[0].model.label

      if (this.sectionTitle) {
        label.html =
          `<span class="govuk-caption-xl">${this.sectionTitle}</span> ${label.text}`
      }

      label.isPageHeading = true
      label.classes = 'govuk-label--xl'
      pageTitle = label.text
      showTitle = false
    }

    return { pageTitle, sectionTitle, showTitle, useForm, components, errors }
  }

  getFormDataFromState (state) {
    return this.formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getFormDataFromState(state))
      return acc
    }, {})
  }

  getStateFromValidForm (formData) {
    return this.formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getStateFromValidForm(formData))
      return acc
    }, {})
  }

  getErrors (validationResult) {
    if (validationResult && validationResult.error) {
      return {
        titleText: ERROR_SUMMARY_TITLE,
        errorList: validationResult.error.details.map(err => {
          const name = err.path.map((name, index) => index > 0 ? `__${name}` : name).join('')

          return {
            path: err.path.join('.'),
            href: `#${name}`,
            name: name,
            text: err.message
          }
        })
      }
    }
  }

  validateForm (payload) {
    const result = this.formSchema.validate(payload, VALIDATION_OPTIONS)
    const errors = result.error ? this.getErrors(result) : null

    return { value: result.value, errors }
  }

  get viewName () { return VIEW_NAME }
}

module.exports = Page
