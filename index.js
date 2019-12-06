const pkg = require('./package.json')

const Page = require('./page')

const handlerProvider = (route, handlerOptions) => {
  const getExistingData = handlerOptions.getExistingData
  const setData = handlerOptions.setData
  const getNextPagePath = handlerOptions.getNextPagePath
  const pageDefinition = handlerOptions.pageDefinition

  const page = new Page(pageDefinition)

  if (route.method === 'get') {
    return async (request, h) => {
      const state = await getExistingData(request)
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
        const update = page.getStateFromValidForm(formResult.value)
        const setDataResult = await setData(request, update)

        if (setDataResult && setDataResult.errors) {
          return h.view(page.viewName, page.getViewModel(payload, setDataResult.errors))
        } else {
          const nextPagePath = await getNextPagePath(request)

          return h.redirect(nextPagePath)
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
