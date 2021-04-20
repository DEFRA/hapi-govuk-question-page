const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const CurrencyField = require('../../components/currencyfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const name = 'testCurrencyField'
const defaultClasses = 'govuk-input--width-10'
const suppliedClasses = 'test classes'

lab.experiment('CurrencyField', () => {
  lab.experiment('getViewModel', () => {
    lab.test('disables spell check', () => {
      const currencyField = new CurrencyField({ name })
      const viewModel = currencyField.getViewModel({}, { testCurrencyField: null })
      expect(viewModel.attributes.spellcheck).to.equal('false')
    })
    lab.test('sets default classes when no options', () => {
      const currencyField = new CurrencyField({ name })
      expect(currencyField.options.classes).to.equal(defaultClasses)
    })
    lab.test('sets classes when supplied', () => {
      const currencyField = new CurrencyField({ name, options: { classes: suppliedClasses } })
      expect(currencyField.options.classes).to.equal(suppliedClasses)
    })
  })
  lab.experiment('getStateFromValidForm', () => {
    lab.test('empty returns null', () => {
      const currencyField = new CurrencyField({ name })
      const stateFromValidForm = currencyField.getStateFromValidForm({})
      expect(stateFromValidForm[name]).to.be.null()
    })
    lab.test('populated returns decimal to two places', () => {
      const currencyField = new CurrencyField({ name })
      const stateFromValidForm = currencyField.getStateFromValidForm({ [name]: '123.45' })
      expect(stateFromValidForm[name]).to.equal(123.45)
    })
  })
})
