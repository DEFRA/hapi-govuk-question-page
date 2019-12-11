const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const CheckboxesField = require('../../components/checkboxesfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testCheckboxesField'
const standardDefinition = {
  name: componentName,
  options: { list: { type: 'number', items: [{ value: 1, text: 'A' }] } }
}
const definitionWithConfiguration = {
  name: componentName,
  type: 'number',
  options: {
    required: false,
    bold: true,
    list: {
      type: 'number',
      items: [
        { value: 1, text: 'A' },
        { value: 2, text: 'B', description: 'B description' },
        { value: 3, text: 'C', conditionalHtml: '<p class="govuk-body">Conditional HTML</p>' }
      ]
    }
  }
}
const formData = {
  [componentName]: ''
}

lab.experiment('CheckboxesField', () => {
  lab.experiment('getViewModel', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        context.checkboxesField = new CheckboxesField(standardDefinition)
        context.viewModel = context.checkboxesField.getViewModel(formData)
      })
      lab.test('includes items', ({ context }) => {
        expect(context.viewModel.items.length).to.equal(1)
      })
      lab.test('doesn\'t bold items', ({ context }) => {
        expect(context.viewModel.items[0].label).to.not.exist()
      })
      lab.test('no hint', ({ context }) => {
        expect(context.viewModel.items[0].hint).to.not.exist()
      })
      lab.test('no conditional content', ({ context }) => {
        expect(context.viewModel.items[0].conditional).to.not.exist()
      })
      lab.test('not selected', ({ context }) => {
        expect(context.viewModel.items[0].checked).to.be.false()
      })
      lab.test('selection missing', ({ context }) => {
        const viewModel = context.checkboxesField.getViewModel({})
        expect(viewModel.items[0].checked).to.be.false()
      })
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        context.checkboxesField = new CheckboxesField(definitionWithConfiguration)
        context.viewModel = context.checkboxesField.getViewModel(formData)
      })
      lab.test('includes items', ({ context }) => {
        expect(context.viewModel.items.length).to.equal(3)
      })
      lab.test('bolds items', ({ context }) => {
        expect(context.viewModel.items[0].label.classes).to.equal('govuk-label--s')
      })
      lab.test('hint', ({ context }) => {
        expect(context.viewModel.items[1].hint.html).to.equal('B description')
      })
      lab.test('conditional content', ({ context }) => {
        expect(context.viewModel.items[2].conditional.html).to.equal('<p class="govuk-body">Conditional HTML</p>')
      })
      lab.test('selects item', ({ context }) => {
        const viewModel = context.checkboxesField.getViewModel({ [componentName]: '2' })
        expect(viewModel.items[1].checked).to.be.true()
      })
      lab.test('selects array of items', ({ context }) => {
        const viewModel = context.checkboxesField.getViewModel({ [componentName]: ['2', '3'] })
        expect(viewModel.items[1].checked).to.be.true()
        expect(viewModel.items[2].checked).to.be.true()
      })
      lab.test('selects multiple items in text', ({ context }) => {
        const viewModel = context.checkboxesField.getViewModel({ [componentName]: '2,3' })
        expect(viewModel.items[1].checked).to.be.true()
        expect(viewModel.items[2].checked).to.be.true()
      })
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.beforeEach(({ context }) => {
      context.checkboxesField = new CheckboxesField(definitionWithConfiguration)
    })
    lab.test('missing value', ({ context }) => {
      const displayStringFromState = context.checkboxesField.getDisplayStringFromState({})
      expect(displayStringFromState).to.equal('')
    })
    lab.test('no value', ({ context }) => {
      const displayStringFromState = context.checkboxesField.getDisplayStringFromState({ [componentName]: null })
      expect(displayStringFromState).to.equal('')
    })
    lab.test('value', ({ context }) => {
      const displayStringFromState = context.checkboxesField.getDisplayStringFromState({ [componentName]: 2 })
      expect(displayStringFromState).to.equal('B')
    })
    lab.test('multi-value', ({ context }) => {
      const displayStringFromState = context.checkboxesField.getDisplayStringFromState({ [componentName]: [2, 3] })
      expect(displayStringFromState).to.equal('B, C')
    })
    lab.test('unknown value', ({ context }) => {
      const displayStringFromState = context.checkboxesField.getDisplayStringFromState({ [componentName]: 99 })
      expect(displayStringFromState).to.equal('')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        const checkboxesField = new CheckboxesField(standardDefinition)
        context.formSchemaKeys = checkboxesField.getFormSchemaKeys()
      })
      lab.test('returns schema for defined name', ({ context }) => {
        expect(context.formSchemaKeys[componentName]).to.exist()
      })
      lab.test('required', ({ context }) => {
        const schema = context.formSchemaKeys[componentName]
        let result = schema.validate('1')
        expect(result.error).to.not.exist()
        result = schema.validate(undefined)
        expect(result.error).to.exist()
      })
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        const checkboxesField = new CheckboxesField(definitionWithConfiguration)
        const formSchemaKeys = checkboxesField.getFormSchemaKeys()
        context.schema = formSchemaKeys[componentName]
      })
      lab.test('valid value', ({ context }) => {
        const result = context.schema.validate('1')
        expect(result.error).to.not.exist()
      })
      lab.test('invalid value', ({ context }) => {
        const result = context.schema.validate('99')
        expect(result.error).to.exist()
      })
      lab.test('invalid number', ({ context }) => {
        const result = context.schema.validate('not a number')
        expect(result.error).to.exist()
      })
    })
  })
})
