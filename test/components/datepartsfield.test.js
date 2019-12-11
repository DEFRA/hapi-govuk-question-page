const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const joi = require('@hapi/joi')

const DatePartsField = require('../../components/datepartsfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testDatePartsField'
const dayName = `${componentName}__day`
const monthName = `${componentName}__month`
const yearName = `${componentName}__year`

const standardDefinition = {
  name: componentName
}
const definitionWithConfiguration = {
  name: componentName,
  options: { required: false }
}
const formData = { [dayName]: '1', [monthName]: '10', [yearName]: '2000' }
const stateDate = new Date(2000, 9, 1)
const state = { [componentName]: stateDate }

lab.experiment('DatePartsField', () => {
  lab.beforeEach(({ context }) => {
    context.datePartsField = new DatePartsField(standardDefinition)
  })
  lab.experiment('getFormDataFromState', () => {
    lab.test('empty', ({ context }) => {
      const formDataFromState = context.datePartsField.getFormDataFromState({})
      expect(formDataFromState[dayName]).to.equal('')
      expect(formDataFromState[monthName]).to.equal('')
      expect(formDataFromState[yearName]).to.equal('')
    })
    lab.test('populated', ({ context }) => {
      const formDataFromState = context.datePartsField.getFormDataFromState(state)
      expect(formDataFromState[dayName]).to.equal('1')
      expect(formDataFromState[monthName]).to.equal('10')
      expect(formDataFromState[yearName]).to.equal('2000')
    })
  })
  lab.experiment('getStateFromValidForm', () => {
    lab.test('empty', ({ context }) => {
      const stateFromValidForm = context.datePartsField.getStateFromValidForm({})
      expect(stateFromValidForm[componentName]).to.be.null()
    })
    lab.test('populated', ({ context }) => {
      const stateFromValidForm = context.datePartsField.getStateFromValidForm(formData)
      expect(stateFromValidForm[componentName]).to.equal(stateDate)
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.test('empty', ({ context }) => {
      const displayStringFromState = context.datePartsField.getDisplayStringFromState({})
      expect(displayStringFromState).to.equal('')
    })
    lab.test('populated', ({ context }) => {
      const displayStringFromState = context.datePartsField.getDisplayStringFromState(state)
      expect(displayStringFromState).to.equal('1 October 2000')
    })
  })
  lab.experiment('getViewModel', () => {
    lab.test('includes items', ({ context }) => {
      const viewModel = context.datePartsField.getViewModel(formData)
      expect(viewModel.items.length).to.equal(3)
      expect(viewModel.items[0].name).to.equal(dayName)
      expect(viewModel.items[1].name).to.equal(monthName)
      expect(viewModel.items[2].name).to.equal(yearName)
      expect(viewModel.items[0].value).to.equal('1')
      expect(viewModel.items[1].value).to.equal('10')
      expect(viewModel.items[2].value).to.equal('2000')
    })
    lab.test('doesn\'t add error classes when no error', ({ context }) => {
      const viewModel = context.datePartsField.getViewModel(formData)
      expect(viewModel.items[0].classes).to.not.include('govuk-input--error')
      expect(viewModel.items[1].classes).to.not.include('govuk-input--error')
      expect(viewModel.items[2].classes).to.not.include('govuk-input--error')
    })
    lab.test('adds error classes when error', ({ context }) => {
      const viewModel = context.datePartsField.getViewModel(formData, { errorList: [{ name: componentName, text: 'Error' }] })
      expect(viewModel.items[0].classes).to.include('govuk-input--error')
      expect(viewModel.items[1].classes).to.include('govuk-input--error')
      expect(viewModel.items[2].classes).to.include('govuk-input--error')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.beforeEach(({ context }) => {
      context.formSchemaKeys = context.datePartsField.getFormSchemaKeys()
      context.testSchema = joi.object(context.formSchemaKeys)
      context.testData = Object.assign({}, formData)
    })
    lab.test('returns schema for defined name', ({ context }) => {
      expect(context.formSchemaKeys[componentName]).to.exist()
    })
    lab.test('required', ({ context }) => {
      let result = context.testSchema.validate(context.testData)
      expect(result.error).to.not.exist()
      result = context.testSchema.validate({})
      expect(result.error).to.exist()
    })
    lab.test('not required', () => {
      const datePartsField = new DatePartsField(definitionWithConfiguration)
      const formSchemaKeys = datePartsField.getFormSchemaKeys()
      const schema = joi.object(formSchemaKeys)
      const result = schema.validate({})
      expect(result.error).to.not.exist()
    })
    lab.test('missing day', ({ context }) => {
      context.testData[dayName] = ''
      let result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
      delete context.testData[dayName]
      result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
    })
    lab.test('missing month', ({ context }) => {
      context.testData[monthName] = ''
      let result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
      delete context.testData[monthName]
      result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
    })
    lab.test('missing year', ({ context }) => {
      context.testData[yearName] = ''
      let result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
      delete context.testData[yearName]
      result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
    })
    lab.test('invalid number', ({ context }) => {
      context.testData[dayName] = '1.2'
      let result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
      context.testData[dayName] = 'A'
      result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
    })
    lab.test('invalid date (\'31st\' of November)', ({ context }) => {
      context.testData[dayName] = '31'
      context.testData[monthName] = '11'
      const result = context.testSchema.validate(context.testData)
      expect(result.error).to.exist()
    })
  })
})
