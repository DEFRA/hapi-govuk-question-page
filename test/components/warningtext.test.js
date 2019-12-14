const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const WarningText = require('../../components/warningtext')

const { expect } = Code
const lab = exports.lab = Lab.script()

const standardDefinition = {
  text: 'Test text'
}
const definitionWithSummary = {
  text: 'Test text',
  summary: 'Summary'
}

lab.experiment('WarningText', () => {
  lab.experiment('getViewModel', () => {
    lab.test('returns defined text and default summary', () => {
      const insetText = new WarningText(standardDefinition)
      const viewModel = insetText.getViewModel()
      expect(viewModel.text).to.equal('Test text')
      expect(viewModel.iconFallbackText).to.equal('Warning')
    })
    lab.test('returns defined summary', () => {
      const insetText = new WarningText(definitionWithSummary)
      const viewModel = insetText.getViewModel()
      expect(viewModel.iconFallbackText).to.equal('Summary')
    })
  })
})
