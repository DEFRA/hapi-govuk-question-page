const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const TextField = require('../../components/textfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testTextField'
const standardDefinition = {
  name: componentName
}
const definitionWithConfiguration = {
  name: componentName,
  schema: { max: 10, trim: false },
  options: { required: false }
}
const maxWordsDefinition = {
  name: componentName,
  schema: { max: 10, maxwords: 10 }
}
const formData = {
  [componentName]: null
}

lab.experiment('TextField', () => {
  lab.experiment('getViewModel', () => {
    lab.test('doesn\'t include maxlength when not configured', () => {
      const textField = new TextField(standardDefinition)
      const viewModel = textField.getViewModel(formData)
      expect(viewModel.attributes.maxlength).to.not.exist()
    })
    lab.test('includes maxlength when configured', () => {
      const textField = new TextField(definitionWithConfiguration)
      const viewModel = textField.getViewModel(formData)
      expect(viewModel.attributes).to.exist()
      expect(viewModel.attributes.maxlength).to.equal(10)
    })
    lab.test('doesn\'t include maxlength when maxwords is configured', () => {
      const textField = new TextField(maxWordsDefinition)
      const viewModel = textField.getViewModel(formData)
      expect(viewModel.attributes.maxlength).to.not.exist()
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const textField = new TextField(standardDefinition)
      const formSchemaKeys = textField.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
    lab.test('required', () => {
      const textField = new TextField(standardDefinition)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      let result = schema.validate('a')
      expect(result.error).to.not.exist()
      result = schema.validate(undefined)
      expect(result.error).to.exist()
      result = schema.validate('')
      expect(result.error).to.exist()
    })
    lab.test('not required', () => {
      const textField = new TextField(definitionWithConfiguration)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate(undefined)
      expect(result.error).to.not.exist()
    })
    lab.test('trim', () => {
      const textField = new TextField(standardDefinition)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate(' test ')
      expect(result.value).to.equal('test')
    })
    lab.test('no trim', () => {
      const textField = new TextField(definitionWithConfiguration)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      const result = schema.validate(' test ')
      expect(result.value).to.equal(' test ')
    })
    lab.test('max', () => {
      const textField = new TextField(definitionWithConfiguration)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      let result = schema.validate('1234567890')
      expect(result.error).to.not.exist()
      result = schema.validate('12345678910')
      expect(result.error).to.exist()
    })
    lab.test('maxwords', () => {
      const textField = new TextField(maxWordsDefinition)
      const formSchemaKeys = textField.getFormSchemaKeys()
      const schema = formSchemaKeys[componentName]
      let result = schema.validate('12345678910')
      expect(result.error).to.not.exist()
      result = schema.validate('1 2 3 4 5 6 7 8 9 10 11')
      expect(result.error).to.exist()
    })
  })
})
