const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const HiddenValue = require('../../components/hiddenvalue')

const { expect } = Code
const lab = Lab.script()

const componentName = 'testHiddenValue'
const standardDefinition = {
  name: componentName,
  value: '5050'
}
const formData = {
  [componentName]: null
}

lab.experiment('HiddenValue', () => {
  lab.experiment('getViewModel', () => {
    lab.test('is given the defined value', () => {
      const hiddenValue = new HiddenValue(standardDefinition)
      const viewModel = hiddenValue.getViewModel({}, formData)
      expect(viewModel.value).to.equal('5050')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const hiddenValue = new HiddenValue(standardDefinition)
      const formSchemaKeys = hiddenValue.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
  })
})

module.exports.lab = lab
