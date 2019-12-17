const pkg = require('./package.json')
const Page = require('./page')

const VIEW_NAME = 'hapi-govuk-question-page/page'
const DEFAULT_PAGE_TEMPLATE_NAME = 'layout.html'

const handlerProvider = (route, handlerOptions) => {
  const {
    pageTemplateName = DEFAULT_PAGE_TEMPLATE_NAME,
    pageDefinition,
    getConfig = () => ({}),
    getData = () => ({}),
    setData = () => {},
    nextPath,
    getNextPath
  } = handlerOptions

  const page = new Page(pageDefinition, pageTemplateName)

  if (route.method === 'get') {
    return async (request, h) => {
      const config = await getConfig(request)
      const state = await getData(request)
      const formData = page.getFormDataFromState(state, config)
      return h.view(VIEW_NAME, page.getViewModel(config, formData))
    }
  } else if (route.method === 'post') {
    return async (request, h) => {
      const payload = request.payload
      const config = await getConfig(request)
      const formResult = page.validateForm(payload, config)

      if (formResult.errors) {
        return h.view(VIEW_NAME, page.getViewModel(config, payload, formResult.errors))
      } else {
        const dataToSet = page.getStateFromValidForm(formResult.value, config)
        const setDataResult = await setData(request, dataToSet)

        if (setDataResult && setDataResult.errors) {
          return h.view(VIEW_NAME, page.getViewModel(config, payload, setDataResult.errors))
        } else {
          const redirectPath = (getNextPath && await getNextPath(request)) || nextPath
          if (redirectPath) {
            return h.redirect(redirectPath)
          } else {
            return h.redirect(request.path)
          }
        }
      }
    }
  }
}

module.exports = {
  pkg,
  once: true,
  register: (server) => {
    server.decorate('handler', 'hapi-govuk-question-page', handlerProvider)
  }
}
