const pkg = require('./package.json')
const Page = require('./page')

const VIEW_NAME = 'digital-form-page/page.html'
const DEFAULT_PAGE_TEMPLATE_NAME = 'layout.html'

const handlerProvider = (route, handlerOptions) => {
  const {
    pageTemplateName = DEFAULT_PAGE_TEMPLATE_NAME,
    pageDefinition,
    getData = () => ({}),
    setData = () => {},
    nextPath,
    getNextPath
  } = handlerOptions

  const page = new Page(pageDefinition, pageTemplateName)

  if (route.method === 'get') {
    return async (request, h) => {
      const state = await getData(request)
      const formData = page.getFormDataFromState(state)
      return h.view(VIEW_NAME, page.getViewModel(formData))
    }
  } else if (route.method === 'post') {
    return async (request, h) => {
      const payload = request.payload
      const formResult = page.validateForm(payload)

      if (formResult.errors) {
        return h.view(VIEW_NAME, page.getViewModel(payload, formResult.errors))
      } else {
        const dataToSet = page.getStateFromValidForm(formResult.value)
        const setDataResult = await setData(request, dataToSet)

        if (setDataResult && setDataResult.errors) {
          return h.view(VIEW_NAME, page.getViewModel(payload, setDataResult.errors))
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
    server.decorate('handler', 'digital-form-page', handlerProvider)
  }
}
