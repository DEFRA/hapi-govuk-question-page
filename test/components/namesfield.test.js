const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const NamesField = require('../../components/namesfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  name: 'testNamesField'
}

const expectedClasses = 'govuk-input--width-20'

lab.experiment('NamesField', () => {
  let namesField
  lab.beforeEach(() => {
    namesField = new NamesField(definition)
  })
  lab.experiment('options', () => {
    lab.test('sets classes when no options', () => {
      expect(namesField.options.classes).to.equal(expectedClasses)
    })
    lab.test('sets classes when not provided in options', () => {
      const definitionWithOptions = {
        name: 'testNamesField',
        options: {}
      }
      namesField = new NamesField(definitionWithOptions)
      expect(namesField.options.classes).to.equal(expectedClasses)
    })
    lab.test('doesn\'t set classes when provided in options', () => {
      const definitionWithOptions = {
        name: 'testNamesField',
        options: { classes: 'test classes' }
      }
      namesField = new NamesField(definitionWithOptions)
      expect(namesField.options.classes).to.equal('test classes')
    })
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = namesField.getViewModel({}, { testNamesField: null })
    })
    lab.test('sets spellcheck attribute', () => {
      expect(viewModel.attributes.spellcheck).to.equal('false')
    })
    lab.test('sets autocomplete attribute', () => {
      const definitionWithOptions = {
        name: 'testNamesField',
        options: { autocomplete: true }
      }
      namesField = new NamesField(definitionWithOptions)
      viewModel = namesField.getViewModel({}, { testNamesField: null })
      expect(viewModel.autocomplete).to.equal('name')
    })
  })
})
