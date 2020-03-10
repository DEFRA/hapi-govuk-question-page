const pkg = require('./package.json')
const PLUGIN_NAME = pkg.name.split('/')[1]
const Page = require('./page')

const DEFAULT_VIEW_NAME = `${PLUGIN_NAME}/page`
const DEFAULT_PAGE_TEMPLATE_NAME = 'layout.html'

const getConfigFromRequest = request => {
  if (request && request.app && request.app[PLUGIN_NAME]) {
    return request.app[PLUGIN_NAME].config
  }
}

const getDataFromRequest = request => {
  if (request && request.app && request.app[PLUGIN_NAME]) {
    return request.app[PLUGIN_NAME].data
  }
}

const setDataOnRequest = (request, dataToSet) => {
  if (request.app) {
    request.app[PLUGIN_NAME] = request.app[PLUGIN_NAME] || {}
    request.app[PLUGIN_NAME].data = dataToSet
  }
}

const buildHandlerProviderForOptions = (options = {}) => {
  const { pageTemplateName: defaultPageTemplateName = DEFAULT_PAGE_TEMPLATE_NAME } = options

  return (route, handlerOptions) => {
    const {
      pageTemplateName = defaultPageTemplateName,
      viewName = DEFAULT_VIEW_NAME,
      pageDefinition,
      getConfig = getConfigFromRequest,
      getData = getDataFromRequest,
      setData = setDataOnRequest,
      nextPath,
      getNextPath
    } = handlerOptions

    const page = new Page(pageDefinition, pageTemplateName)

    if (route.method === 'get') {
      return async (request, h) => {
        const config = await getConfig(request)
        const state = await getData(request)
        const formData = page.getFormDataFromState(state, config)
        return h.view(viewName, page.getViewModel(config, formData))
      }
    } else if (route.method === 'post') {
      return async (request, h) => {
        const { payload = {} } = request || {}
        const config = await getConfig(request)
        const formResult = page.validateForm(payload, config)

        if (formResult.errors) {
          return h.view(viewName, page.getViewModel(config, payload, formResult.errors))
        } else {
          const dataToSet = page.getStateFromValidForm(formResult.value, config)
          const setDataResult = await setData(request, dataToSet)

          if (setDataResult && setDataResult.errors) {
            return h.view(viewName, page.getViewModel(config, payload, setDataResult.errors))
          } else {
            const redirectPath = (getNextPath && await getNextPath(request)) || nextPath
            if (redirectPath) {
              return h.redirect(redirectPath)
            } else {
              return h.continue
            }
          }
        }
      }
    }
  }
}

module.exports = {
  pkg,
  register: (server, options) => {
    server.decorate('handler', `${PLUGIN_NAME}`, buildHandlerProviderForOptions(options))
  }
}
