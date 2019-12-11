const pkg = require('./package.json')

const Page = require('./page')

const handlerProvider = (route, handlerOptions) => {
  const getData = handlerOptions.getData || (() => ({}))
  const setData = handlerOptions.setData || (() => {})
  const getNextPath = handlerOptions.getNextPath
  const pageDefinition = handlerOptions.pageDefinition

  const page = new Page(pageDefinition)

  if (route.method === 'get') {
    return async (request, h) => {
      const state = await getData(request)
      const formData = page.getFormDataFromState(state)
      return h.view(page.viewName, page.getViewModel(formData))
    }
  } else if (route.method === 'post') {
    return async (request, h) => {
      const payload = request.payload
      const formResult = page.validateForm(payload)

      if (formResult.errors) {
        return h.view(page.viewName, page.getViewModel(payload, formResult.errors))
      } else {
        const dataToSet = page.getStateFromValidForm(formResult.value)
        const setDataResult = await setData(request, dataToSet)

        if (setDataResult && setDataResult.errors) {
          return h.view(page.viewName, page.getViewModel(payload, setDataResult.errors))
        } else {
          if (getNextPath) {
            const nextPath = await getNextPath(request)
            return h.redirect(nextPath)
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
