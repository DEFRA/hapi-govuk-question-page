const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const joi = require('@hapi/joi')

const CheckboxesWithTextField = require('../../components/checkboxeswithtextfield')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testCheckboxesWithTextField'
const definition = {
  name: componentName,
  type: 'number',
  options: {
    required: false,
    bold: true,
    list: {
      type: 'number',
      items: [
        { value: 1, text: 'A', description: 'A description', conditionalTextField: { name: 'textA', title: 'Text A', titleForError: 'The Text A', hint: 'Hint A', schema: { max: 10, trim: false } } },
        { value: 2, text: 'B' },
        { value: 3, text: 'C', conditionalTextField: { name: 'textC' } },
        { value: 4, text: 'D', conditionalTextField: { name: 'textD', title: 'Text D' } }
      ]
    }
  }
}
const formData = {
  [componentName]: ''
}

lab.experiment('CheckboxesWithTextField', () => {
  lab.experiment('mapItemForViewModel', () => {
    lab.beforeEach(({ context }) => {
      context.checkboxesWithTextField = new CheckboxesWithTextField(definition)
      context.items = context.checkboxesWithTextField.listItems
    })
    lab.test('has no conditional content', ({ context }) => {
      const itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[1], false)
      expect(itemForViewModel.conditional).to.not.exist()
    })
    lab.test('has conditional content', ({ context }) => {
      const itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[0], false)
      expect(itemForViewModel.conditional).to.exist()
      expect(itemForViewModel.conditional.input).to.exist()
    })
    lab.test('has label when has no title', ({ context }) => {
      const itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[2], false)
      expect(itemForViewModel.conditional.input.label.text).to.equal('C')
    })
    lab.test('has hint', ({ context }) => {
      let itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[0], false)
      expect(itemForViewModel.conditional.input.hint.html).to.equal('Hint A')
      itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[3], false)
      expect(itemForViewModel.conditional.input.hint).to.not.exist()
    })
    lab.test('includes maxlength', ({ context }) => {
      let itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[0], false)
      expect(itemForViewModel.conditional.input.attributes).to.exist()
      expect(itemForViewModel.conditional.input.attributes.maxlength).to.equal(10)
      itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, null, context.items[3], false)
      expect(itemForViewModel.conditional.input.attributes).to.not.exist()
    })
    lab.test('has error', ({ context }) => {
      const itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, { errorList: [{ name: 'textA', text: 'error' }] }, context.items[0], false)
      expect(itemForViewModel.conditional.input.errorMessage.text).to.equal('error')
    })
    lab.test('doesn\'t have matching error', ({ context }) => {
      const itemForViewModel = context.checkboxesWithTextField.mapItemForViewModel({}, formData, { errorList: [{ name: 'textC', text: 'error' }] }, context.items[0], false)
      expect(itemForViewModel.conditional.input.errorMessage).to.not.exist()
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.beforeEach(({ context }) => {
      context.checkboxesWithTextField = new CheckboxesWithTextField(definition)
      context.items = context.checkboxesWithTextField.items
      context.formSchemaKeys = context.checkboxesWithTextField.getFormSchemaKeys()
      context.testSchema = joi.object(context.formSchemaKeys)
    })
    lab.test('returns schema for defined items', ({ context }) => {
      expect(context.formSchemaKeys.textA).to.exist()
      expect(context.formSchemaKeys.textB).to.not.exist()
      expect(context.formSchemaKeys.textC).to.exist()
      expect(context.formSchemaKeys.textD).to.exist()
    })
    lab.test('missing valid when not checked', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '' })
      expect(result.error).to.not.exist()
    })
    lab.test('blank valid when not checked', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '', textA: '' })
      expect(result.error).to.not.exist()
    })
    lab.test('missing invalid when checked', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '1' })
      expect(result.error).to.exist()
    })
    lab.test('blank invalid when checked', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '1', textA: '' })
      expect(result.error).to.exist()
    })
    lab.test('trim', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '3', textC: ' test ' })
      expect(result.value.textC).to.equal('test')
    })
    lab.test('no trim', ({ context }) => {
      const result = context.testSchema.validate({ [componentName]: '1', textA: ' test ' })
      expect(result.value.textA).to.equal(' test ')
    })
    lab.test('max', ({ context }) => {
      let result = context.testSchema.validate({ [componentName]: '1', textA: '1234567890' })
      expect(result.error).to.not.exist()
      result = context.testSchema.validate({ [componentName]: '1', textA: '12345678910' })
      expect(result.error).to.exist()
    })
  })
  lab.experiment('getFormDataFromState', () => {
    lab.beforeEach(({ context }) => {
      context.checkboxesWithTextField = new CheckboxesWithTextField(definition)
    })
    lab.test('when empty', ({ context }) => {
      const formDataFromState = context.checkboxesWithTextField.getFormDataFromState({})
      expect(formDataFromState.textA).to.equal('')
      expect(formDataFromState.textB).to.not.exist()
      expect(formDataFromState.textC).to.equal('')
      expect(formDataFromState.textD).to.equal('')
    })
    lab.test('when populated', ({ context }) => {
      const formDataFromState = context.checkboxesWithTextField.getFormDataFromState({ [componentName]: 1, textA: 'test' })
      expect(formDataFromState.textA).to.equal('test')
      expect(formDataFromState.textB).to.not.exist()
      expect(formDataFromState.textC).to.equal('')
      expect(formDataFromState.textD).to.equal('')
    })
  })
  lab.experiment('getStateFromValidForm', () => {
    lab.beforeEach(({ context }) => {
      context.checkboxesWithTextField = new CheckboxesWithTextField(definition)
    })
    lab.test('when empty', ({ context }) => {
      const stateFromValidForm = context.checkboxesWithTextField.getStateFromValidForm({})
      expect(stateFromValidForm.textA).to.be.null()
      expect(stateFromValidForm.textB).to.not.exist()
      expect(stateFromValidForm.textC).to.be.null()
      expect(stateFromValidForm.textD).to.be.null()
    })
    lab.test('when populated', ({ context }) => {
      const stateFromValidForm = context.checkboxesWithTextField.getStateFromValidForm({ [componentName]: 1, textA: 'test' })
      expect(stateFromValidForm.textA).to.equal('test')
      expect(stateFromValidForm.textB).to.not.exist()
      expect(stateFromValidForm.textC).to.be.null()
      expect(stateFromValidForm.textD).to.be.null()
    })
    lab.test('when populated but not checked', ({ context }) => {
      const stateFromValidForm = context.checkboxesWithTextField.getStateFromValidForm({ [componentName]: 3, textA: 'test' })
      expect(stateFromValidForm.textA).to.be.null()
      expect(stateFromValidForm.textB).to.not.exist()
      expect(stateFromValidForm.textC).to.be.null()
      expect(stateFromValidForm.textD).to.be.null()
    })
  })
})
