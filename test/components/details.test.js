const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const Details = require('../../components/details')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  title: 'Test title',
  content: 'Test content'
}

lab.experiment('Details', () => {
  let details
  lab.beforeEach(() => {
    details = new Details(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = details.getViewModel()
    })
    lab.test('returns summaryHtml and html', () => {
      expect(viewModel.summaryHtml).to.equal('Test title')
      expect(viewModel.html).to.equal('Test content')
    })
  })
})
