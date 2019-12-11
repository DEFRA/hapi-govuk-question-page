const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const NumberField = require('../../components/numberfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testNumberField'
const standardDefinition = {
  name: componentName
}
const integerDefinition = {
  name: componentName,
  schema: { integer: true, min: 10, max: 11 },
  options: { required: false }
}
const floatDefinition = {
  name: componentName,
  schema: { greater: 10.1, less: 10.2 },
  options: { required: false }
}
const formData = {
  [componentName]: null
}

lab.experiment('NumberField', () => {
  lab.experiment('getViewModel', () => {
    lab.test('is number type', () => {
      const numberField = new NumberField(standardDefinition)
      const viewModel = numberField.getViewModel(formData)
      expect(viewModel.type).to.equal('number')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const numberField = new NumberField(standardDefinition)
      const formSchemaKeys = numberField.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
    lab.test('required', () => {
      const numberField = new NumberField(standardDefinition)
      const formSchemaKeys = numberField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      let result = schema.validate('1')
      expect(result.error).to.not.exist()
      result = schema.validate(undefined)
      expect(result.error).to.exist()
      result = schema.validate('')
      expect(result.error).to.exist()
    })
    lab.experiment('integer', () => {
      lab.beforeEach(({ context }) => {
        const numberField = new NumberField(integerDefinition)
        const formSchemaKeys = numberField.getFormSchemaKeys()
        context.schema = formSchemaKeys[componentName]
      })
      lab.test('is integer', ({ context }) => {
        let result = context.schema.validate('10')
        expect(result.error).to.not.exist()
        result = context.schema.validate('10.1')
        expect(result.error).to.exist()
      })
      lab.test('is not less than min', ({ context }) => {
        let result = context.schema.validate('10')
        expect(result.error).to.not.exist()
        result = context.schema.validate('9')
        expect(result.error).to.exist()
      })
      lab.test('is not more than max', ({ context }) => {
        let result = context.schema.validate('11')
        expect(result.error).to.not.exist()
        result = context.schema.validate('12')
        expect(result.error).to.exist()
      })
    })
    lab.experiment('float', () => {
      lab.beforeEach(({ context }) => {
        const numberField = new NumberField(floatDefinition)
        const formSchemaKeys = numberField.getFormSchemaKeys()
        context.schema = formSchemaKeys[componentName]
      })
      lab.test('is greater than', ({ context }) => {
        let result = context.schema.validate('10.11')
        expect(result.error).to.not.exist()
        result = context.schema.validate('10.1')
        expect(result.error).to.exist()
      })
      lab.test('is less than', ({ context }) => {
        let result = context.schema.validate('10.19')
        expect(result.error).to.not.exist()
        result = context.schema.validate('10.2')
        expect(result.error).to.exist()
      })
    })
  })
})
