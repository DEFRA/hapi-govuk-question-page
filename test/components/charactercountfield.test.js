const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const CharacterCountField = require('../../components/charactercountfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const definition = {
  name: 'testCharacterCountField',
  schema: {
    max: 10
  }
}

lab.experiment('CharacterCountField', () => {
  let characterCountField
  lab.beforeEach(() => {
    characterCountField = new CharacterCountField(definition)
  })
  lab.experiment('getViewModel', () => {
    let viewModel
    lab.beforeEach(() => {
      viewModel = characterCountField.getViewModel({ testCharacterCountField: null })
    })
    lab.test('includes maxlength when maxwords not configured', () => {
      expect(viewModel.maxlength).to.equal(10)
      expect(viewModel.maxwords).to.not.exist()
    })
    lab.test('includes maxwords when configured', () => {
      const definitionWithRows = {
        name: 'testCharacterCountField',
        schema: { maxwords: 5 }
      }
      characterCountField = new CharacterCountField(definitionWithRows)
      viewModel = characterCountField.getViewModel({ testCharacterCountField: null })
      expect(viewModel.maxlength).to.not.exist()
      expect(viewModel.maxwords).to.equal(5)
    })
    lab.test('doesn\'t include threshold when not configured', () => {
      expect(viewModel.threshold).to.not.exist()
    })
    lab.test('includes threshold when configured', () => {
      const definitionWithRows = {
        name: 'testCharacterCountField',
        options: { threshold: 10 }
      }
      characterCountField = new CharacterCountField(definitionWithRows)
      viewModel = characterCountField.getViewModel({ testCharacterCountField: null })
      expect(viewModel.threshold).to.equal(10)
    })
  })
})
