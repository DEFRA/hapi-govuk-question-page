const { ComponentCollection } = require('./components')

const FORM_SCHEMA = Symbol('FORM_SCHEMA')
const STATE_SCHEMA = Symbol('STATE_SCHEMA')

class Page {
  constructor (pageDef) {
    this.title = pageDef.title
    this.condition = pageDef.condition
    this.sectionTitle = pageDef.sectionTitle

    // Components collection
    const components = new ComponentCollection(pageDef.components)
    this.components = components
    const conditionalFormComponents = components.formItems.filter(c => c.conditionalComponents)
    this.hasFormComponents = !!components.formItems.length
    this.hasConditionalFormComponents = !!conditionalFormComponents.length

    // Schema
    this[FORM_SCHEMA] = this.components.formSchema
    this[STATE_SCHEMA] = this.components.stateSchema
  }

  getViewModel (formData, errors) {
    let showTitle = true
    let pageTitle = this.title
    const sectionTitle = this.sectionTitle
    const components = this.components.getViewModel(formData, errors)
    const formComponents = components.filter(c => c.isFormComponent)
    const hasSingleFormComponent = formComponents.length === 1
    const singleFormComponent = hasSingleFormComponent && formComponents[0]
    const singleFormComponentIsFirst = singleFormComponent && singleFormComponent === components[0]

    if (hasSingleFormComponent && singleFormComponentIsFirst) {
      const label = singleFormComponent.model.label

      if (this.sectionTitle) {
        label.html =
          `<span class="govuk-caption-xl">${this.sectionTitle}</span> ${label.text}`
      }

      label.isPageHeading = true
      label.classes = 'govuk-label--xl'
      pageTitle = label.text
      showTitle = false
    }

    return { page: this, pageTitle, sectionTitle, showTitle, components, errors }
  }

  getFormDataFromState (state) {
    return this.components.getFormDataFromState(state || {})
  }

  getStateFromValidForm (formData) {
    return this.components.getStateFromValidForm(formData)
  }

  getErrors (validationResult) {
    if (validationResult && validationResult.error) {
      return {
        titleText: this.errorSummaryTitle,
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

  validate (value, schema) {
    const result = schema.validate(value, this.validationOptions)
    const errors = result.error ? this.getErrors(result) : null

    return { value: result.value, errors }
  }

  validateForm (payload) {
    return this.validate(payload, this.formSchema)
  }

  validateState (newState) {
    return this.validate(newState, this.stateSchema)
  }

  getPartialMergeState (value) {
    return value
  }

  get viewName () { return 'index' }
  get validationOptions () { return { abortEarly: false } }
  get errorSummaryTitle () { return 'Fix the following errors' }
  get formSchema () { return this[FORM_SCHEMA] }
  set formSchema (value) { this[FORM_SCHEMA] = value }
  get stateSchema () { return this[STATE_SCHEMA] }
  set stateSchema (value) { this[STATE_SCHEMA] = value }
}

module.exports = Page
