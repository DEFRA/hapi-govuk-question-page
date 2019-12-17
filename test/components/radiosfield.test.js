const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const RadiosField = require('../../components/radiosfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testRadiosField'
const standardDefinition = {
  name: componentName,
  options: { list: { type: 'number', items: [{ value: 1, text: 'A' }] } }
}
const definitionWithConfiguration = {
  name: componentName,
  options: {
    required: false,
    filterable: true,
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
  [componentName]: null
}

lab.experiment('RadiosField', () => {
  lab.experiment('getViewModel', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        const radiosField = new RadiosField(standardDefinition)
        context.viewModel = radiosField.getViewModel({}, formData)
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
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        context.radiosField = new RadiosField(definitionWithConfiguration)
        context.viewModel = context.radiosField.getViewModel({}, formData)
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
        const viewModel = context.radiosField.getViewModel({}, { [componentName]: '2' })
        expect(viewModel.items[1].checked).to.be.true()
      })
    })
    lab.experiment('with filter', () => {
      lab.beforeEach(({ context }) => {
        context.radiosField = new RadiosField(definitionWithConfiguration)
      })
      lab.test('includes items', ({ context }) => {
        const viewModel = context.radiosField.getViewModel({ [componentName]: { filter: [1, 2] } }, formData)
        expect(viewModel.items.length).to.equal(2)
      })
      lab.test('filter is not array', ({ context }) => {
        const viewModel = context.radiosField.getViewModel({ [componentName]: { filter: 1 } }, formData)
        expect(viewModel.items.length).to.equal(3)
      })
      lab.test('filter has fewer than 2 valid items', ({ context }) => {
        const viewModel = context.radiosField.getViewModel({ [componentName]: { filter: [1, 99] } }, formData)
        expect(viewModel.items.length).to.equal(3)
      })
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.beforeEach(({ context }) => {
      context.radiosField = new RadiosField(definitionWithConfiguration)
    })
    lab.test('no value', ({ context }) => {
      const displayStringFromState = context.radiosField.getDisplayStringFromState({ [componentName]: null })
      expect(displayStringFromState).to.equal('')
    })
    lab.test('value', ({ context }) => {
      const displayStringFromState = context.radiosField.getDisplayStringFromState({ [componentName]: 2 })
      expect(displayStringFromState).to.equal('B')
    })
    lab.test('unknown value', ({ context }) => {
      const displayStringFromState = context.radiosField.getDisplayStringFromState({ [componentName]: 99 })
      expect(displayStringFromState).to.equal('')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        const radiosField = new RadiosField(standardDefinition)
        context.formSchemaKeys = radiosField.getFormSchemaKeys()
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
        const radiosField = new RadiosField(definitionWithConfiguration)
        const formSchemaKeys = radiosField.getFormSchemaKeys()
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
    })
    lab.experiment('with filter', () => {
      lab.beforeEach(({ context }) => {
        context.radiosField = new RadiosField(definitionWithConfiguration)
      })
      lab.test('valid value', ({ context }) => {
        const formSchemaKeys = context.radiosField.getFormSchemaKeys({ [componentName]: { filter: [1, 2] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('1')
        expect(result.error).to.not.exist()
      })
      lab.test('invalid value', ({ context }) => {
        const formSchemaKeys = context.radiosField.getFormSchemaKeys({ [componentName]: { filter: [1, 2] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.exist()
      })
      lab.test('filter is not array', ({ context }) => {
        const formSchemaKeys = context.radiosField.getFormSchemaKeys({ [componentName]: { filter: 1 } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.not.exist()
      })
      lab.test('filter has fewer than 2 valid items', ({ context }) => {
        const formSchemaKeys = context.radiosField.getFormSchemaKeys({ [componentName]: { filter: [1, 99] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.not.exist()
      })
    })
  })
})
