const TextField = require('./textfield')
const toCurrency = require('../lib/tocurrency')

class CurrencyField extends TextField {
  constructor (definition) {
    super(definition)
    this.options = this.options || {}
    if (!this.options.classes) {
      this.options.classes = 'govuk-input--width-10'
    }
    if (!this.options.prefix) {
      this.options.prefix = { text: '£' }
    }
    const prefixPattern = this.options.prefix.text ? '|' + this.options.prefix.text : ''
    this.formSchema = this.formSchema.pattern(new RegExp('^[0-9|.|,' + prefixPattern + ']+$'), 'numbers')
  }

  getStateFromValidForm (validatedFormData) {
    return {
      [this.name]: toCurrency(validatedFormData[this.name])
    }
  }

  getFormSchemaKeys (config) {
    const { name } = this
    const { titleForErrorText } = this.getTextForErrors(config)
    let formSchema = super.getFormSchemaKeys(config)[name]

    formSchema = formSchema.messages({
      'string.pattern.name': `${titleForErrorText} must be a number`
    })
    return { [name]: formSchema }
  }

  getViewModel (config, formData, errors) {
    const viewModel = super.getViewModel(config, formData, errors)
    viewModel.attributes.spellcheck = 'false'
    return viewModel
  }
}

module.exports = CurrencyField
