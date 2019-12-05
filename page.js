const { ComponentCollection } = require('./components')

const VIEW_NAME = 'index'
const ERROR_SUMMARY_TITLE = 'Fix the following errors'
const VALIDATION_OPTIONS = { abortEarly: false }

class Page {
  constructor (pageDef) {
    this.title = pageDef.title
    this.condition = pageDef.condition
    this.sectionTitle = pageDef.sectionTitle

    // Components collection
    const components = new ComponentCollection(pageDef.components)
    this.components = components
    this.hasFormComponents = !!components.formComponents.length

    // Schema
    this.formSchema = this.components.formSchema
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
