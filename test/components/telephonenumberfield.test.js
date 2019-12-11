const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const TelephoneNumberField = require('../../components/telephonenumberfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  name: 'testTelephoneNumberField'
}

const expectedType = 'tel'
const expectedClasses = 'govuk-input--width-10'

lab.experiment('TelephoneNumberField', () => {
  let telephoneNumberField
  lab.beforeEach(() => {
    telephoneNumberField = new TelephoneNumberField(definition)
  })
  lab.experiment('options', () => {
    lab.test('sets classes when no options', () => {
      expect(telephoneNumberField.options.classes).to.equal(expectedClasses)
    })
    lab.test('sets classes when not provided in options', () => {
      const definitionWithOptions = {
        name: 'testEmailAddressField',
        options: {}
      }
      telephoneNumberField = new TelephoneNumberField(definitionWithOptions)
      expect(telephoneNumberField.options.classes).to.equal(expectedClasses)
    })
    lab.test('doesn\'t set classes when provided in options', () => {
      const definitionWithOptions = {
        name: 'testEmailAddressField',
        options: { classes: 'test classes' }
      }
      telephoneNumberField = new TelephoneNumberField(definitionWithOptions)
      expect(telephoneNumberField.options.classes).to.equal('test classes')
    })
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = telephoneNumberField.getViewModel({ testTelephoneNumberField: null })
    })
    lab.test('is correct type', () => {
      expect(viewModel.type).to.equal(expectedType)
    })
  })
})
