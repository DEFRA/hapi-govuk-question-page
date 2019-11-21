const joi = require('@hapi/joi')
// const boom = require('@hapi/boom')
const pkg = require('./package.json')

const Page = require('./page')
const addressService = require('./address-service')

const handlerProvider = (route, handlerOptions) => {
  // console.log(`Route handler: Route method: ${route.method} Options: ${JSON.stringify(handlerOptions)}`)
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
        const newState = page.getStateFromValidForm(formResult.value)
        const stateResult = page.validateState(newState)

        if (stateResult.errors) {
          return h.view(page.viewName, page.getViewModel(payload, stateResult.errors))
        } else {
          const update = page.getPartialMergeState(stateResult.value)
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
}

module.exports = {
  pkg,
  once: true,
  register: (server, registrationOptions) => {
    // console.log(`Registration: Options: ${JSON.stringify(registrationOptions)}`)
    const { ordnanceSurveyKey } = registrationOptions

    server.decorate('handler', 'digital-form-page', handlerProvider)

    // FIND ADDRESS
    server.route([{
      method: 'GET',
      path: '/__/ukaddressfield.js',
      options: {
        handler: { file: 'client/ukaddressfield.js' },
        files: { relativeTo: __dirname }
      }
    }, {
      method: 'GET',
      path: '/__/find-address',
      handler: async (request, h) => {
        try {
          const results = await addressService(ordnanceSurveyKey, request.query.postcode)
          return results
        } catch (err) {
          // return boom.badImplementation('Failed to find addresses', err)
          return [{ uprn: 'x', address: 'address', item: { BUILDING_NUMBER: '1', POST_TOWN: 'The Town', POSTCODE: 'XX1 1XX' } }]
        }
      },
      options: {
        validate: {
          query: joi.object({ postcode: joi.string().required() })
        }
      }
    }])
  }
}
