const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const EmailAddressField = require('../../components/emailaddressfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  name: 'testEmailAddressField'
}

const expectedType = 'email'
const expectedClasses = 'govuk-input--width-20'

lab.experiment('EmailAddressField', () => {
  let emailAddressField
  lab.beforeEach(() => {
    emailAddressField = new EmailAddressField(definition)
  })
  lab.experiment('options', () => {
    lab.test('sets classes when no options', () => {
      expect(emailAddressField.options.classes).to.equal(expectedClasses)
    })
    lab.test('sets classes when not provided in options', () => {
      const definitionWithOptions = {
        name: 'testEmailAddressField',
        options: {}
      }
      emailAddressField = new EmailAddressField(definitionWithOptions)
      expect(emailAddressField.options.classes).to.equal(expectedClasses)
    })
    lab.test('doesn\'t set classes when provided in options', () => {
      const definitionWithOptions = {
        name: 'testEmailAddressField',
        options: { classes: 'test classes' }
      }
      emailAddressField = new EmailAddressField(definitionWithOptions)
      expect(emailAddressField.options.classes).to.equal('test classes')
    })
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = emailAddressField.getViewModel({ testEmailAddressField: null })
    })
    lab.test('is correct type', () => {
      expect(viewModel.type).to.equal(expectedType)
    })
  })
})
