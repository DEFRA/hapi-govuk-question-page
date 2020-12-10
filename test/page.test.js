const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const { expect } = Code
const lab = exports.lab = Lab.script()

const Page = require('../page')

const standardDefinition = {
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' },
    { type: 'TextField', name: 'textField2', title: 'Text Field 2' }
  ]
}
const singleFieldDefinition = {
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const singleFieldWithCaptionDefinition = {
  caption: 'Caption',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const singleFieldWithPageTitleDefinition = {
  title: 'Title',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const singleFieldWithSubmitButtonDefinition = {
  title: 'Title',
  submitButtonText: 'Save',
  components: [
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const htmlWithTextFieldDefinition = {
  components: [
    { type: 'Html' },
    { type: 'TextField', name: 'textField', title: 'Text Field' }
  ]
}
const htmlDefinition = {
  hasNext: false,
  components: [
    { type: 'Html' }
  ]
}
const paraDefinition = {
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
    lab.test('default page title when multiple form components', () => {
      const page = new Page(standardDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.pageTitle).to.equal('Question')
    })
    lab.test('default page title when no form components', () => {
      const page = new Page(paraDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.pageTitle).to.equal('Question')
    })
    lab.test('default page title when non-form components before single form component', () => {
      const page = new Page(htmlWithTextFieldDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.pageTitle).to.equal('Question')
    })
    lab.test('page title from single form component when no title configured', () => {
      const page = new Page(singleFieldDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.pageTitle).to.equal('Text Field')
    })
    lab.test('configured page title even when single form component', () => {
      const page = new Page(singleFieldWithPageTitleDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.pageTitle).to.equal('Title')
    })
    lab.test('use configured button text', () => {
      const page = new Page(singleFieldWithSubmitButtonDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.buttonText).to.equal('Save')
    })
    lab.test('use default button text when not configured', () => {
      const page = new Page(singleFieldWithPageTitleDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.buttonText).to.equal('Continue')
    })
    lab.test('caption included with single form component', () => {
      const page = new Page(singleFieldWithCaptionDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.components[0].model.label.html).to.contain('Caption')
    })
    lab.test('request-specific page title', () => {
      const page = new Page(standardDefinition)
      const viewModel = page.getViewModel({ $PAGE$: { title: 'Title' } }, {})
      expect(viewModel.pageTitle).to.equal('Title')
    })
    lab.test('request-specific caption', () => {
      const page = new Page(standardDefinition)
      const viewModel = page.getViewModel({ $PAGE$: { caption: 'Caption' } }, {})
      expect(viewModel.pageCaption).to.equal('Caption')
    })
    lab.test('request-specific caption included with single form component', () => {
      const page = new Page(singleFieldDefinition)
      const viewModel = page.getViewModel({ $PAGE$: { caption: 'Caption' } }, {})
      expect(viewModel.components[0].model.label.html).to.contain('Caption')
    })
    lab.test('use form when has form components', () => {
      const page = new Page(singleFieldDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.useForm).to.be.true()
    })
    lab.test('use form when has next', () => {
      const page = new Page(paraDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.useForm).to.be.true()
    })
    lab.test('no form when no form components and doesn\'t have next', () => {
      const page = new Page(htmlDefinition)
      const viewModel = page.getViewModel({}, {})
      expect(viewModel.useForm).to.be.false()
    })
    lab.test('can set additional view data via $VIEW$ config property', () => {
      const page = new Page(standardDefinition)
      const viewModel = page.getViewModel({
        $VIEW$: {
          foo: 'bar'
        }
      }, {})
      expect(viewModel.foo).to.equal('bar')
    })
  })
})
