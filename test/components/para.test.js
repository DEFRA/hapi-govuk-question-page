const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const Para = require('../../components/para')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  content: 'Test content'
}

lab.experiment('Para', () => {
  let para
  lab.beforeEach(() => {
    para = new Para(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = para.getViewModel()
    })
    lab.test('returns content', () => {
      expect(viewModel.content).to.equal('Test content')
    })
  })
})
