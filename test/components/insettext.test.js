const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const InsetText = require('../../components/insettext')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  content: 'Test content'
}

lab.experiment('InsetText', () => {
  let insetText
  lab.beforeEach(() => {
    insetText = new InsetText(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = insetText.getViewModel()
    })
    lab.test('returns content', () => {
      expect(viewModel.content).to.equal('Test content')
    })
  })
})
