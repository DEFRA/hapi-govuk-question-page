const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const SelectField = require('../../components/selectfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testSelectField'
const standardDefinition = {
  name: componentName,
  options: { list: { type: 'number', items: [{ value: 1, text: 'A' }] } }
}
const definitionWithConfiguration = {
  name: componentName,
  options: {
    required: false,
    filterable: true,
    list: {
      type: 'number',
      items: [
        { value: 1, text: 'A' },
        { value: 2, text: 'B' },
        { value: 3, text: 'C' }
      ]
    }
  }
}
const formData = {
  [componentName]: null
}

lab.experiment('SelectField', () => {
  lab.experiment('getViewModel', () => {
    lab.test('includes blank item', () => {
      const selectField = new SelectField(standardDefinition)
      const viewModel = selectField.getViewModel({}, formData)
      expect(viewModel.items.length).to.equal(2)
      expect(viewModel.items[0].text).to.equal('')
    })
    lab.test('includes items', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const viewModel = selectField.getViewModel({}, formData)
      expect(viewModel.items.length).to.equal(4)
    })
    lab.test('selects item', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const viewModel = selectField.getViewModel({}, { [componentName]: '2' })
      expect(viewModel.items[2].selected).to.be.true()
    })
    lab.experiment('with filter', () => {
      lab.beforeEach(({ context }) => {
        context.selectField = new SelectField(definitionWithConfiguration)
      })
      lab.test('includes items', ({ context }) => {
        const viewModel = context.selectField.getViewModel({ [componentName]: { filter: [1, 2] } }, formData)
        expect(viewModel.items.length).to.equal(3)
      })
      lab.test('filter is not array', ({ context }) => {
        const viewModel = context.selectField.getViewModel({ [componentName]: { filter: 1 } }, formData)
        expect(viewModel.items.length).to.equal(4)
      })
      lab.test('filter has fewer than 2 valid items', ({ context }) => {
        const viewModel = context.selectField.getViewModel({ [componentName]: { filter: [1, 99] } }, formData)
        expect(viewModel.items.length).to.equal(4)
      })
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.test('no value', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const displayStringFromState = selectField.getDisplayStringFromState({ [componentName]: null })
      expect(displayStringFromState).to.equal('')
    })
    lab.test('value', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const displayStringFromState = selectField.getDisplayStringFromState({ [componentName]: 2 })
      expect(displayStringFromState).to.equal('B')
    })
    lab.test('unknown value', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const displayStringFromState = selectField.getDisplayStringFromState({ [componentName]: 99 })
      expect(displayStringFromState).to.equal('')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const selectField = new SelectField(standardDefinition)
      const formSchemaKeys = selectField.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
    lab.test('required', () => {
      const selectField = new SelectField(standardDefinition)
      const formSchemaKeys = selectField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      let result = schema.validate('1')
      expect(result.error).to.not.exist()
      result = schema.validate(undefined)
      expect(result.error).to.exist()
    })
    lab.test('not required', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const formSchemaKeys = selectField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate(undefined)
      expect(result.error).to.not.exist()
    })
    lab.test('valid value', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const formSchemaKeys = selectField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate('1')
      expect(result.error).to.not.exist()
    })
    lab.test('invalid value', () => {
      const selectField = new SelectField(definitionWithConfiguration)
      const formSchemaKeys = selectField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate('99')
      expect(result.error).to.exist()
    })
    lab.experiment('with filter', () => {
      lab.beforeEach(({ context }) => {
        context.selectField = new SelectField(definitionWithConfiguration)
      })
      lab.test('valid value', ({ context }) => {
        const formSchemaKeys = context.selectField.getFormSchemaKeys({ [componentName]: { filter: [1, 2] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('1')
        expect(result.error).to.not.exist()
      })
      lab.test('invalid value', ({ context }) => {
        const formSchemaKeys = context.selectField.getFormSchemaKeys({ [componentName]: { filter: [1, 2] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.exist()
      })
      lab.test('filter is not array', ({ context }) => {
        const formSchemaKeys = context.selectField.getFormSchemaKeys({ [componentName]: { filter: 1 } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.not.exist()
      })
      lab.test('filter has fewer than 2 valid items', ({ context }) => {
        const formSchemaKeys = context.selectField.getFormSchemaKeys({ [componentName]: { filter: [1, 99] } })
        context.schema = formSchemaKeys[componentName]
        const result = context.schema.validate('3')
        expect(result.error).to.not.exist()
      })
    })
  })
})
