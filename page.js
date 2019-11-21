// const joi = require('@hapi/joi')
// const { proceed } = require('./helpers')
const { ComponentCollection } = require('./components')

const FORM_SCHEMA = Symbol('FORM_SCHEMA')
const STATE_SCHEMA = Symbol('STATE_SCHEMA')

class Page {
  // constructor (model, pageDef) {
  constructor (pageDef) {
    // const { def } = model

    // Properties
    /*
    this.def = def
    this.model = model
     */

    // this.pageDef = pageDef
    // this.path = pageDef.path
    this.title = pageDef.title
    this.condition = pageDef.condition

    // Resolve section
    // const section = pageDef.section &&
    //   model.sections.find(s => s.name === pageDef.section)
    // const section = pageDef.section
    const sectionTitle = pageDef.sectionTitle

    // this.section = section
    this.sectionTitle = sectionTitle

    // Components collection
    // const components = new ComponentCollection(pageDef.components, model)
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
    // const sectionTitle = this.section && this.section.title
    const sectionTitle = this.sectionTitle
    const components = this.components.getViewModel(formData, errors)
    const formComponents = components.filter(c => c.isFormComponent)
    const hasSingleFormComponent = formComponents.length === 1
    const singleFormComponent = hasSingleFormComponent && formComponents[0]
    const singleFormComponentIsFirst = singleFormComponent && singleFormComponent === components[0]

    if (hasSingleFormComponent && singleFormComponentIsFirst) {
      const label = singleFormComponent.model.label

      // if (this.section) {
      //   label.html =
      //     `<span class="govuk-caption-xl">${this.section.title}</span> ${label.text}`
      // }
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

  // getNext (state) {
  //   const page = this.model.pages.filter(p => p !== this).find(page => {
  //     const value = page.section ? state[page.section.name] : state
  //     const isRequired = page.condition
  //       ? (this.model.conditions[page.condition]).fn(state)
  //       : true
  //
  //     if (isRequired) {
  //       if (!page.hasFormComponents) {
  //         return true
  //       } else {
  //         const error = joi.validate(value || {}, page.stateSchema.required(), this.model.conditionOptions).error
  //         const isValid = !error
  //
  //         return !isValid
  //       }
  //     }
  //   })
  //
  //   return (page && page.path) || this.defaultNextPath
  // }
  //
  getFormDataFromState (state) {
    // const pageState = this.section ? state[this.section.name] : state
    const pageState = state
    return this.components.getFormDataFromState(pageState || {})
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

  // makeGetRouteHandler (getState) {
  //   return async (request, h) => {
  //     const state = await getState(request)
  //     const formData = this.getFormDataFromState(state)
  //     return h.view(this.viewName, this.getViewModel(formData))
  //   }
  // }
  //
  // makePostRouteHandler (mergeState) {
  //   return async (request, h) => {
  //     const payload = request.payload
  //     const formResult = this.validateForm(payload)
  //
  //     if (formResult.errors) {
  //       return h.view(this.viewName, this.getViewModel(payload, formResult.errors))
  //     } else {
  //       const newState = this.getStateFromValidForm(formResult.value)
  //       const stateResult = this.validateState(newState)
  //
  //       if (stateResult.errors) {
  //         return h.view(this.viewName, this.getViewModel(payload, stateResult.errors))
  //       } else {
  //         const update = this.getPartialMergeState(stateResult.value)
  //
  //         const state = await mergeState(request, update)
  //
  //         return this.proceed(request, h, state)
  //       }
  //     }
  //   }
  // }
  //
  // makeGetRoute (getState) {
  //   return {
  //     method: 'get',
  //     path: this.path,
  //     options: this.getRouteOptions,
  //     handler: this.makeGetRouteHandler(getState)
  //   }
  // }
  //
  // makePostRoute (mergeState) {
  //   return {
  //     method: 'post',
  //     path: this.path,
  //     options: this.postRouteOptions,
  //     handler: this.makePostRouteHandler(mergeState)
  //   }
  // }
  //
  // proceed (request, h, state) {
  //   return proceed(request, h, this.getNext(state))
  // }

  getPartialMergeState (value) {
    // return this.section ? { [this.section.name]: value } : value
    return value
  }

  get viewName () { return 'index' }
  // get defaultNextPath () { return '/summary' }
  get validationOptions () { return { abortEarly: false } }
  // get conditionOptions () { return this.model.conditionOptions }
  get errorSummaryTitle () { return 'Fix the following errors' }
  // get getRouteOptions () { return {} }
  // get postRouteOptions () { return {} }
  get formSchema () { return this[FORM_SCHEMA] }
  set formSchema (value) { this[FORM_SCHEMA] = value }
  get stateSchema () { return this[STATE_SCHEMA] }
  set stateSchema (value) { this[STATE_SCHEMA] = value }
}

module.exports = Page
