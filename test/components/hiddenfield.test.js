const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const HiddenField = require('../../components/hiddenfield')

const { expect } = Code
const lab = Lab.script()

const componentName = 'testHiddenField'
const standardDefinition = {
  name: componentName,
  value: '5050'
}
const formData = {
  [componentName]: null
}

lab.experiment('HiddenField', () => {
  lab.experiment('getViewModel', () => {
    lab.test('is given the defined value', () => {
      const hiddenField = new HiddenField(standardDefinition)
      const viewModel = hiddenField.getViewModel({}, formData)
      expect(viewModel.value).to.equal('5050')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const hiddenField = new HiddenField(standardDefinition)
      const formSchemaKeys = hiddenField.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
  })
})

module.exports.lab = lab
