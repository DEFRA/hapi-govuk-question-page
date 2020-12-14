const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const { FormComponent } = require('../../components')

const { expect } = Code
const lab = exports.lab = Lab.script()

const componentName = 'testFormComponent'
const standardDefinition = {
  name: componentName,
  title: 'Title'
}
const definitionWithConfiguration = {
  name: componentName,
  title: 'Title',
  titleForError: 'The Title',
  hint: 'Hint',
  options: {
    required: false,
    classes: 'test classes',
    isPageHeading: true
  }
}
const formData = {
  [componentName]: ''
}

lab.experiment('FormComponent', () => {
  lab.experiment('getFormDataFromState', () => {
    lab.beforeEach(({ context }) => {
      context.formComponent = new FormComponent(standardDefinition)
    })
    lab.test('when empty', ({ context }) => {
      const formDataFromState = context.formComponent.getFormDataFromState({})
      expect(formDataFromState).to.not.exist()
    })
    lab.test('when blank', ({ context }) => {
      const formDataFromState = context.formComponent.getFormDataFromState({ [componentName]: null })
      expect(formDataFromState[componentName]).to.equal('')
    })
    lab.test('when populated', ({ context }) => {
      const formDataFromState = context.formComponent.getFormDataFromState({ [componentName]: 1 })
      expect(formDataFromState[componentName]).to.equal('1')
    })
  })
  lab.experiment('getStateFromValidForm', () => {
    lab.beforeEach(({ context }) => {
      context.formComponent = new FormComponent(standardDefinition)
    })
    lab.test('when empty', ({ context }) => {
      const stateFromValidForm = context.formComponent.getStateFromValidForm({})
      expect(stateFromValidForm[componentName]).to.be.null()
    })
    lab.test('when blank', ({ context }) => {
      const stateFromValidForm = context.formComponent.getStateFromValidForm({ [componentName]: '' })
      expect(stateFromValidForm[componentName]).to.be.null()
    })
    lab.test('when populated', ({ context }) => {
      const stateFromValidForm = context.formComponent.getStateFromValidForm({ [componentName]: '1' })
      expect(stateFromValidForm[componentName]).to.equal('1')
    })
  })
  lab.experiment('getViewModel', () => {
    lab.experiment('standard definition', () => {
      lab.beforeEach(({ context }) => {
        context.formComponent = new FormComponent(standardDefinition)
      })
      lab.test('has label', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.label).to.exist()
        expect(viewModel.label.text).to.equal('Title')
      })
      lab.test('label is not page heading', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.label).to.exist()
        expect(viewModel.label.isPageHeading).to.equal(false)
      })
      lab.test('no error message', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.errorMessage).to.not.exist()
      })
      lab.test('has error message when error', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData, { errorList: [{ name: componentName, text: 'error' }] })
        expect(viewModel.errorMessage.text).to.equal('error')
      })
      lab.test('doesn\'t have non-matching error', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData, { errorList: [{ name: `NOT${componentName}`, text: 'error' }] })
        expect(viewModel.errorMessage).to.not.exist()
      })
      lab.test('has value', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, { [componentName]: 'test' })
        expect(viewModel.value).to.equal('test')
      })
    })
    lab.experiment('with additional configuration', () => {
      lab.beforeEach(({ context }) => {
        context.formComponent = new FormComponent(definitionWithConfiguration)
      })
      lab.test('is optional', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.label).to.exist()
        expect(viewModel.label.text).to.equal('Title (optional)')
      })
      lab.test('has hint', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.hint).to.exist()
        expect(viewModel.hint.html).to.equal('Hint')
      })
      lab.test('is optional', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.errorMessage).to.not.exist()
      })
      lab.test('label is page heading', ({ context }) => {
        const viewModel = context.formComponent.getViewModel({}, formData)
        expect(viewModel.label).to.exist()
        expect(viewModel.label.isPageHeading).to.equal(true)
      })
    })
    lab.test('with no title', () => {
      const formComponent = new FormComponent({ name: componentName })
      const viewModel = formComponent.getViewModel({}, formData)
      expect(viewModel.label).to.exist()
      expect(viewModel.label.text).to.equal('testFormComponent')
    })
  })
  lab.experiment('getFormSchemaKeys', () => {
    lab.test('returns schema for defined name', () => {
      const formComponent = new FormComponent(standardDefinition)
      const formSchemaKeys = formComponent.getFormSchemaKeys()
      expect(formSchemaKeys[componentName]).to.exist()
    })
  })
  lab.experiment('getDisplayStringFromState', () => {
    lab.test('empty', () => {
      const formComponent = new FormComponent(standardDefinition)
      const displayStringFromState = formComponent.getDisplayStringFromState({})
      expect(displayStringFromState).to.equal('')
    })
    lab.test('populated', () => {
      const formComponent = new FormComponent(standardDefinition)
      const displayStringFromState = formComponent.getDisplayStringFromState({ [componentName]: 1 })
      expect(displayStringFromState).to.equal('1')
    })
  })

  lab.experiment('getTextForErrors', () => {
    lab.test('without config', () => {
      const formComponent = new FormComponent(definitionWithConfiguration)
      const { titleForErrorText, nameForErrorText } = formComponent.getTextForErrors() || {}
      expect(titleForErrorText).to.equal('The Title')
      expect(nameForErrorText).to.equal('the Title')
    })
    lab.test('with config', () => {
      const formComponent = new FormComponent(standardDefinition)
      const { titleForErrorText, nameForErrorText } = formComponent.getTextForErrors({ [componentName]: { title: 'title', titleForError: 'titleForError' } })
      expect(titleForErrorText).to.equal('titleForError')
      expect(nameForErrorText).to.equal('titleForError')
    })
  })
})
