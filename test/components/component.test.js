const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const { Component } = require('../../components')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  title: 'Test title',
  content: 'Test content'
}

lab.experiment('Component', () => {
  lab.experiment('getViewModel', () => {
    lab.test('returns empty model', () => {
      const component = new Component(definition)
      const viewModel = component.getViewModel()
      expect(viewModel).to.equal({})
    })
  })
})
