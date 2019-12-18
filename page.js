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

const DEFAULT_PAGE_TITLE = 'Question'
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
    const { title, caption, hasNext = true } = pageDef
    this.title = title
    this.caption = caption
    this.hasNext = hasNext
    this.pageTemplateName = pageTemplateName

    const components = pageDef.components.map(def => new componentTypes[def.type](def))
    const formComponents = components.filter(component => component.isFormComponent)

    // Components collection
    this.components = components
    this.formComponents = formComponents
    this.hasFormComponents = !!formComponents.length
    this.hasSingleFormComponentFirst = formComponents.length === 1 && formComponents[0] === components[0]
  }

  getViewModel (config = {}, formData, errors) {
    const { $PAGE$: pageConfig = {} } = config
    let { title: pageTitle = this.title, caption: pageCaption = this.caption } = pageConfig
    let showTitle = Boolean(pageTitle)

    const templateName = this.pageTemplateName
    const useForm = this.hasFormComponents || this.hasNext

    const components = this.components.map(component => ({
      type: component.type,
      isFormComponent: component.isFormComponent,
      model: component.getViewModel(config, formData, errors)
    }))

    if (!showTitle) {
      if (this.hasSingleFormComponentFirst) {
        const label = components[0].model.label

        if (pageCaption) {
          label.html = `<span class="govuk-caption-xl">${pageCaption}</span> ${label.text}`
        }

        label.isPageHeading = true
        label.classes = 'govuk-label--xl'
        pageTitle = label.text
      } else {
        pageTitle = DEFAULT_PAGE_TITLE
        showTitle = true
      }
    }

    return { templateName, pageTitle, pageCaption, showTitle, useForm, components, errors }
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
    const formSchemaKeys = this.formComponents.reduce((acc, formComponent) => {
      Object.assign(acc, formComponent.getFormSchemaKeys(config))
      return acc
    }, {})
    const formSchema = joi.object().keys(formSchemaKeys).required()
    const result = formSchema.validate(payload, VALIDATION_OPTIONS)
    const errors = result.error ? mapErrorsForDisplay(result.error) : null

    return { value: result.value, errors }
  }
}

module.exports = Page
