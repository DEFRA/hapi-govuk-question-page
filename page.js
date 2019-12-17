const joi = require('@hapi/joi')
const componentTypesList = [
  'TextField',
  'MultilineTextField',
  'CharacterCountField',
  'YesNoField',
  'DatePartsField',
  'SelectField',
  'RadiosField',
  'CheckboxesField',
  'CheckboxesWithTextField',
  'NumberField',
  'NamesField',
  'TelephoneNumberField',
  'EmailAddressField',
  'Para',
  'Html',
  'DynamicHtml',
  'InsetText',
  'Details',
  'WarningText'
]
const componentTypes = componentTypesList.reduce((acc, name) => {
  acc[name] = require(`./components/${name.toLowerCase()}`)
  return acc
}, {})

const ERROR_SUMMARY_TITLE = 'Fix the following errors'
const VALIDATION_OPTIONS = { abortEarly: false }

const mapErrorsForDisplay = (joiError) => {
  return {
    titleText: ERROR_SUMMARY_TITLE,
    errorList: joiError.details.map(err => {
      const name = err.path[0]

      return {
        href: `#${name}`,
        name: name,
        text: err.message
      }
    })
  }
}

class Page {
  constructor (pageDef, pageTemplateName) {
    const { title, sectionTitle, hasNext = true } = pageDef
    this.title = title
    this.sectionTitle = sectionTitle
    this.hasNext = hasNext
    this.pageTemplateName = pageTemplateName

    const components = pageDef.components.map(def => new componentTypes[def.type](def))
    const dynamicComponents = components.filter(component => component.isDynamicComponent)
    const formComponents = components.filter(component => component.isFormComponent)

    // Components collection
    this.components = components
    this.dynamicComponents = dynamicComponents
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

  getViewModel (config, formData, errors) {
    let showTitle = true
    let pageTitle = this.title
    const sectionTitle = this.sectionTitle
    const templateName = this.pageTemplateName
    const useForm = this.hasFormComponents || this.hasNext
    const components = this.components.map(component => ({ type: component.type, isFormComponent: component.isFormComponent, model: component.getViewModel(config, formData, errors) }))

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

    return { templateName, pageTitle, sectionTitle, showTitle, useForm, components, errors }
  }

  getFormDataFromState (state, config) {
    return this.formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getFormDataFromState(state, config))
      return acc
    }, {})
  }

  getStateFromValidForm (validatedFormData, config) {
    return this.formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getStateFromValidForm(validatedFormData, config))
      return acc
    }, {})
  }

  validateForm (payload, config) {
    const result = this.formSchema.validate(payload, VALIDATION_OPTIONS)
    const errors = result.error ? mapErrorsForDisplay(result.error) : null

    return { value: result.value, errors }
  }
}

module.exports = Page
