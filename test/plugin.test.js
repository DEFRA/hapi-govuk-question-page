const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const { expect } = Code
const lab = exports.lab = Lab.script()

const plugin = require('../index')

lab.experiment('plugin', () => {
  lab.beforeEach(({ context }) => {
    const server = {
      decorate: (type, property, method) => {
        context.type = type
        context.property = property
        context.method = method
      }
    }
    plugin.register(server)
  })
  lab.test('registers correct type and name', ({ context }) => {
    expect(context.type).to.equal('handler')
    expect(context.property).to.equal('hapi-govuk-question-page')
  })
  lab.test('provides handler for GET route', ({ context }) => {
    const handlerForGet = context.method({ method: 'get' }, { pageDefinition: { title: 'Title', components: [] } })
    expect(handlerForGet).to.exist()
  })
  lab.test('provides handler for POST route', ({ context }) => {
    const handlerForPost = context.method({ method: 'post' }, { pageDefinition: { title: 'Title', components: [] } })
    expect(handlerForPost).to.exist()
  })
  lab.test('doesn\'t provide handler for other route methods', ({ context }) => {
    const handlerForDelete = context.method({ method: 'delete' }, { pageDefinition: { title: 'Title', components: [] } })
    expect(handlerForDelete).to.not.exist()
  })
  lab.test('GET handler shows view', async ({ context }) => {
    const handlerForGet = context.method({ method: 'get' }, { getData: () => ({}), pageDefinition: { title: 'Title', components: [] } })
    const h = {
      view: () => 'view'
    }
    const response = await handlerForGet(undefined, h)
    expect(response).to.equal('view')
  })
  lab.test('GET handler shows view when no function defined', async ({ context }) => {
    const handlerForGet = context.method({ method: 'get' }, { pageDefinition: { title: 'Title', components: [] } })
    const h = {
      view: () => 'view'
    }
    const response = await handlerForGet(undefined, h)
    expect(response).to.equal('view')
  })
  lab.test('GET handler shows custom view', async ({ context }) => {
    const handlerForGet = context.method({ method: 'get' }, { viewName: 'customView', pageDefinition: { title: 'Title', components: [] } })
    const h = {
      view: template => template
    }
    const response = await handlerForGet(undefined, h)
    expect(response).to.equal('customView')
  })
  lab.test('POST handler shows view if form validation fails', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const handlerForPost = context.method({ method: 'post' }, { pageDefinition })
    const h = {
      view: () => 'view'
    }
    const response = await handlerForPost({ payload: {} }, h)
    expect(response).to.equal('view')
  })
  lab.test('POST handler shows view if setting data returns an error', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => ({ errors: { errorList: [] } })
    const handlerForPost = context.method({ method: 'post' }, { setData, pageDefinition })
    const h = {
      view: () => 'view'
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('view')
  })
  lab.test('POST handler shows custom view', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => ({ errors: { errorList: [] } })
    const handlerForPost = context.method({ method: 'post' }, { setData, viewName: 'customView', pageDefinition })
    const h = {
      view: template => template
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('customView')
  })
  lab.test('POST handler redirects to next path if setting data succeeds', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => ({})
    const getNextPath = () => 'next path'
    const handlerForPost = context.method({ method: 'post' }, { setData, getNextPath, pageDefinition })
    const h = {
      redirect: (path) => path
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('next path')
  })
  lab.test('POST handler redirects to next path if setting data doesn\'t return a response', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => {}
    const getNextPath = () => 'next path'
    const handlerForPost = context.method({ method: 'post' }, { setData, getNextPath, pageDefinition })
    const h = {
      redirect: (path) => path
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('next path')
  })
  lab.test('POST handler redirects to next path even if setData function not provided', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const getNextPath = () => 'next path'
    const handlerForPost = context.method({ method: 'post' }, { getNextPath, pageDefinition })
    const h = {
      redirect: (path) => path
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('next path')
  })
  lab.test('POST handler redirects to defined fixed path if next path isn\'t defined', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => {}
    const getNextPath = () => false
    const handlerForPost = context.method({ method: 'post' }, { setData, getNextPath, nextPath: 'next path', pageDefinition })
    const h = {
      redirect: (path) => path
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('next path')
  })
  lab.test('POST handler redirects to defined fixed path if next path is defined but doesn\'t return a response', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => {}
    const handlerForPost = context.method({ method: 'post' }, { setData, nextPath: 'next path', pageDefinition })
    const h = {
      redirect: (path) => path
    }
    const response = await handlerForPost({ payload: { textField: 'text' } }, h)
    expect(response).to.equal('next path')
  })
  lab.test('POST handler doesn\'t redirect if no path specific', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const setData = () => {}
    const handlerForPost = context.method({ method: 'post' }, { setData, pageDefinition })
    const h = {
      continue: 'continue'
    }
    const response = await handlerForPost({ path: '/', payload: { textField: 'text' } }, h)
    expect(response).to.equal('continue')
  })
  lab.test('Defaults to using request.app object on GET', async ({ context }) => {
    const handlerForGet = context.method({ method: 'get' }, { pageDefinition: { title: 'Title', components: [] } })
    const h = {
      view: () => 'view'
    }
    let response = await handlerForGet(undefined, h)
    expect(response).to.equal('view')
    response = await handlerForGet({}, h)
    expect(response).to.equal('view')
    response = await handlerForGet({ app: {} }, h)
    expect(response).to.equal('view')
    response = await handlerForGet({ app: { 'hapi-govuk-question-page': {} } }, h)
    expect(response).to.equal('view')
    response = await handlerForGet({ app: { 'hapi-govuk-question-page': { config: {}, data: {} } } }, h)
    expect(response).to.equal('view')
  })
  lab.test('Defaults to using request.app object on POST', async ({ context }) => {
    const pageDefinition = { title: 'Title', components: [{ type: 'TextField', name: 'textField', title: 'Text Field' }] }
    const handlerForPost = context.method({ method: 'post' }, { pageDefinition })
    const h = {
      continue: 'continue',
      view: () => 'view'
    }
    let response = await handlerForPost(undefined, h)
    expect(response).to.equal('view')
    response = await handlerForPost({ path: '/', payload: { textField: 'text' } }, h)
    expect(response).to.equal('continue')
    response = await handlerForPost({ path: '/', payload: { textField: 'text' }, app: {} }, h)
    expect(response).to.equal('continue')
    response = await handlerForPost({ path: '/', payload: { textField: 'text' }, app: { 'hapi-govuk-question-page': {} } }, h)
    expect(response).to.equal('continue')
  })
})
