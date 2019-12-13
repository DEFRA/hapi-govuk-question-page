const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const { expect } = Code
const lab = exports.lab = Lab.script()

const Page = require('../page')

const standardDefinition = {
  title: 'Title',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' },
    { type: 'TextField', name: 'textField2', title: 'Text Field 2' }
  ]
}
const singleFieldDefinition = {
  title: 'Title',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const singleFieldWithSectionDefinition = {
  title: 'Title',
  sectionTitle: 'Section',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const htmlWithTextFieldDefinition = {
  title: 'Title',
  components: [
    { type: 'Html' },
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const htmlDefinition = {
  title: 'Title',
  hasNext: false,
  components: [
    { type: 'Html' }
  ]
}
const paraDefinition = {
  title: 'Title',
  components: [
    { type: 'Para' }
  ]
}

lab.experiment('Page', () => {
  lab.experiment('getFormDataFromState', () => {
    lab.beforeEach(({ context }) => {
      context.page = new Page(standardDefinition)
    })
    lab.test('when empty', ({ context }) => {
      const formDataFromState = context.page.getFormDataFromState({})
      expect(formDataFromState.textField).to.not.exist()
      expect(formDataFromState.textField2).to.not.exist()
    })
    lab.test('when blank', ({ context }) => {
      const formDataFromState = context.page.getFormDataFromState({ textField: null })
      expect(formDataFromState.textField).to.equal('')
      expect(formDataFromState.textField2).to.not.exist()
    })
    lab.test('when partially populated', ({ context }) => {
      const formDataFromState = context.page.getFormDataFromState({ textField: 'text' })
      expect(formDataFromState.textField).to.equal('text')
      expect(formDataFromState.textField2).to.not.exist()
    })
    lab.test('when fully populated', ({ context }) => {
      const formDataFromState = context.page.getFormDataFromState({ textField: 'text', textField2: 'text 2' })
      expect(formDataFromState.textField).to.equal('text')
      expect(formDataFromState.textField2).to.equal('text 2')
    })
  })
  lab.experiment('getStateFromValidForm', () => {
    lab.beforeEach(({ context }) => {
      context.page = new Page(standardDefinition)
    })
    lab.test('when missing', ({ context }) => {
      const stateFromValidForm = context.page.getStateFromValidForm({})
      expect(stateFromValidForm.textField).to.not.exist()
      expect(stateFromValidForm.textField2).to.not.exist()
    })
    lab.test('when blank', ({ context }) => {
      const stateFromValidForm = context.page.getStateFromValidForm({ textField: '' })
      expect(stateFromValidForm.textField).to.be.null()
      expect(stateFromValidForm.textField2).to.not.exist()
    })
    lab.test('when partially populated', ({ context }) => {
      const stateFromValidForm = context.page.getStateFromValidForm({ textField: 'text' })
      expect(stateFromValidForm.textField).to.equal('text')
      expect(stateFromValidForm.textField2).to.not.exist()
    })
    lab.test('when fully populated', ({ context }) => {
      const stateFromValidForm = context.page.getStateFromValidForm({ textField: 'text', textField2: 'text 2' })
      expect(stateFromValidForm.textField).to.equal('text')
      expect(stateFromValidForm.textField2).to.equal('text 2')
    })
  })
  lab.experiment('validateForm', () => {
    lab.beforeEach(({ context }) => {
      context.page = new Page(standardDefinition)
    })
    lab.test('has correct title', ({ context }) => {
      const result = context.page.validateForm({})
      expect(result.errors).to.exist()
      expect(result.errors.titleText).to.equal('Fix the following errors')
    })
    lab.test('error text associated with correct form components', ({ context }) => {
      const result = context.page.validateForm({})
      expect(result.errors.errorList[0].name).to.equal('textField')
      expect(result.errors.errorList[1].name).to.equal('textField2')
    })
    lab.test('errors linked to correct form components', ({ context }) => {
      const result = context.page.validateForm({})
      expect(result.errors.errorList[0].href).to.equal('#textField')
      expect(result.errors.errorList[1].href).to.equal('#textField2')
    })
    lab.test('no errors', ({ context }) => {
      const result = context.page.validateForm({ textField: 'text', textField2: 'text 2' })
      expect(result.errors).to.be.null()
    })
  })
  lab.experiment('getViewModel', () => {
    lab.test('normal page title when multiple form components', () => {
      const page = new Page(standardDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.pageTitle).to.equal('Title')
    })
    lab.test('normal page title when no form components', () => {
      const page = new Page(paraDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.pageTitle).to.equal('Title')
    })
    lab.test('normal page title when non-form components before single form component', () => {
      const page = new Page(htmlWithTextFieldDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.pageTitle).to.equal('Title')
    })
    lab.test('page title from single form component', () => {
      const page = new Page(singleFieldDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.pageTitle).to.equal('Text Field')
    })
    lab.test('section title included with single form component', () => {
      const page = new Page(singleFieldWithSectionDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.components[0].model.label.html).to.contain('Section')
    })
    lab.test('use form when has form components', () => {
      const page = new Page(singleFieldDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.useForm).to.be.true()
    })
    lab.test('use form when has next', () => {
      const page = new Page(paraDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.useForm).to.be.true()
    })
    lab.test('no form when no form components and doesn\'t have next', () => {
      const page = new Page(htmlDefinition)
      const viewModel = page.getViewModel({})
      expect(viewModel.useForm).to.be.false()
    })
  })
})
