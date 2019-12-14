const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const MultilineTextField = require('../../components/multilinetextfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  name: 'testMultilineTextField'
}

lab.experiment('MultilineTextField', () => {
  let multilineTextField
  lab.beforeEach(() => {
    multilineTextField = new MultilineTextField(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = multilineTextField.getViewModel({ testMultilineTextField: null })
    })
    lab.test('doesn\'t include rows when not configured', () => {
      expect(viewModel.rows).to.not.exist()
    })
    lab.test('includes rows when configured', () => {
      const definitionWithRows = {
        name: 'testMultilineTextField',
        options: { rows: 3 }
      }
      multilineTextField = new MultilineTextField(definitionWithRows)
      viewModel = multilineTextField.getViewModel({ testMultilineTextField: null })
      expect(viewModel.rows).to.equal(3)
    })
  })
})
