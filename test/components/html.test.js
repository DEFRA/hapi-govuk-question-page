const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const Html = require('../../components/html')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  content: 'Test content'
}

lab.experiment('Html', () => {
  let html
  lab.beforeEach(() => {
    html = new Html(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = html.getViewModel()
    })
    lab.test('returns content', () => {
      expect(viewModel.content).to.equal('Test content')
    })
  })
})
