const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const YesNoField = require('../../components/yesnofield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testYesNoField'
const standardDefinition = {
  name: componentName
}
const definitionWithConfiguration = {
  name: componentName,
  options: {
    yesFirst: false,
    classes: 'test classes'
  }
}
const formData = {
  [componentName]: null
}

lab.experiment('YesNoField', () => {
  lab.experiment('getViewModel', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        const yesNoField = new YesNoField(standardDefinition)
        context.viewModel = yesNoField.getViewModel({}, formData)
      })
      lab.test('includes items', ({ context }) => {
        expect(context.viewModel.items.length).to.equal(2)
        expect(context.viewModel.items[0].value).to.be.true()
        expect(context.viewModel.items[1].value).to.be.false()
      })
      lab.test('not selected', ({ context }) => {
        expect(context.viewModel.items[0].checked).to.be.false()
        expect(context.viewModel.items[1].checked).to.be.false()
      })
      lab.test('is inline', ({ context }) => {
        expect(context.viewModel.classes).to.equal('govuk-radios--inline')
      })
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        context.yesNoField = new YesNoField(definitionWithConfiguration)
        context.viewModel = context.yesNoField.getViewModel({}, formData)
      })
      lab.test('has no first', ({ context }) => {
        expect(context.viewModel.items[0].value).to.be.false()
        expect(context.viewModel.items[1].value).to.be.true()
      })
      lab.test('has classes', ({ context }) => {
        expect(context.viewModel.classes).to.equal('test classes')
      })
      lab.test('selects item', ({ context }) => {
        const viewModel = context.yesNoField.getViewModel({}, { [componentName]: true })
        expect(viewModel.items[1].checked).to.be.true()
      })
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.beforeEach(({ context }) => {
      context.yesNoField = new YesNoField(definitionWithConfiguration)
    })
    lab.test('no value', ({ context }) => {
      const displayStringFromState = context.yesNoField.getDisplayStringFromState({ [componentName]: null })
      expect(displayStringFromState).to.equal('')
    })
    lab.test('value', ({ context }) => {
      const displayStringFromState = context.yesNoField.getDisplayStringFromState({ [componentName]: true })
      expect(displayStringFromState).to.equal('Yes')
    })
    lab.test('unknown value', ({ context }) => {
      const displayStringFromState = context.yesNoField.getDisplayStringFromState({ [componentName]: 99 })
      expect(displayStringFromState).to.equal('')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.experiment('standard configuration', () => {
      lab.beforeEach(({ context }) => {
        const yesNoField = new YesNoField(standardDefinition)
        context.formSchemaKeys = yesNoField.getFormSchemaKeys()
      })
      lab.test('returns schema for defined name', ({ context }) => {
        expect(context.formSchemaKeys[componentName]).to.exist()
      })
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        const yesNoField = new YesNoField(definitionWithConfiguration)
        const formSchemaKeys = yesNoField.getFormSchemaKeys()
        context.schema = formSchemaKeys[componentName]
      })
      lab.test('valid value', ({ context }) => {
        const result = context.schema.validate('true')
        expect(result.error).to.not.exist()
        expect(result.value).to.be.true()
      })
      lab.test('invalid value', ({ context }) => {
        const result = context.schema.validate('99')
        expect(result.error).to.exist()
      })
    })
  })
})
