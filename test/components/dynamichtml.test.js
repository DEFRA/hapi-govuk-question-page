const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const DynamicHtml = require('../../components/dynamichtml')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testMultilineTextField'

const definition = {
  name: componentName,
  templateHtml: 'Test 1: $PARAM$ 2: $PARAM$'
}

lab.experiment('DynamicHtml', () => {
  lab.experiment('getViewModel', () => {
    lab.beforeEach(({ context }) => {
      context.dynamicHtml = new DynamicHtml(definition)
    })
    lab.test('replaces parameters', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({ [componentName]: { parameterValues: ['A', 'B'] } })
      expect(viewModel.content).to.equal('Test 1: A 2: B')
    })
    lab.test('blanks missing parameters', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({ [componentName]: { parameterValues: ['A'] } })
      expect(viewModel.content).to.equal('Test 1: A 2: ')
    })
    lab.test('ignores extraneous parameters', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({ [componentName]: { parameterValues: ['A'] } })
      expect(viewModel.content).to.equal('Test 1: A 2: ')
    })
    lab.test('blanks all parameters when no values provided', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({ [componentName]: {} })
      expect(viewModel.content).to.equal('Test 1:  2: ')
    })
    lab.test('blanks all parameters when no configuration provided', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({})
      expect(viewModel.content).to.equal('Test 1:  2: ')
    })
    lab.test('HTML-escapes parameters', ({ context }) => {
      const viewModel = context.dynamicHtml.getViewModel({ [componentName]: { parameterValues: ['A', '&<>"\'`'] } })
      expect(viewModel.content).to.equal('Test 1: A 2: &amp;&lt;&gt;&quot;&#x27;&#x60;')
    })
  })
})
