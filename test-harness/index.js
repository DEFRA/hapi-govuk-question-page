const hapi = require('@hapi/hapi')
const hoek = require('@hapi/hoek')
const nunjucks = require('nunjucks')

const visionPlugin = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure(['node_modules/govuk-frontend', 'test-harness/page-template', ...options.path], {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: [
      '.' // When included as a module this would be 'node_modules/hapi-govuk-question-page'
    ],
    isCached: false,
    context: {
      appVersion: '0.0.1',
      assetPath: '/assets',
      serviceName: 'Simple question page test harness',
      pageTitle: 'Simple question page - GOV.UK',
      analyticsAccount: undefined
    }
  }
}

const assetsRoutes = [{
  method: 'GET',
  path: '/assets/govuk-frontend.js',
  handler: {
    file: 'node_modules/govuk-frontend/govuk/all.js'
  }
}, {
  method: 'GET',
  path: '/assets/govuk-frontend.css',
  handler: {
    file: 'test-harness/precompiled-css/govuk-frontend-3.4.0.min.css'
  }
}, {
  method: 'GET',
  path: '/assets/govuk-frontend-ie8.css',
  handler: {
    file: 'test-harness/precompiled-css/govuk-frontend-ie8-3.4.0.min.css'
  }
}, {
  method: 'GET',
  path: '/assets/{path*}',
  handler: {
    directory: {
      path: ['node_modules/govuk-frontend/govuk/assets']
    }
  }
}]

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: 3000,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(visionPlugin)
  await server.register(require('@hapi/inert'))
  await server.register(require('../index'))

  server.route(assetsRoutes)

  // Add the test harness route
  const data = {}
  server.route({
    method: ['GET', 'POST'],
    path: '/',
    handler: {
      'hapi-govuk-question-page': {
        pageTemplateName: 'page.template.njk',
        getConfig: async (request) => {
          return {
            $PAGE$: { title: 'Test harness page', caption: new Date() },
            dynamicHtml: { parameterValues: [request.url, new Date()] },
            checkboxesField: { filter: ['Shetland', 'Shire'] },
            radiosField: { filter: ['soleTrader', 'privateLimitedCompany', 'limitedLiabilityPartnership', 'charity'] },
            numericRadiosField: { filter: [1, 3] },
            checkboxesWithTextField: { filter: ['email', 'phone', 'text'] },
            selectField: { filter: [910400184, 910400195, 910400196, 910400197, 910400198] }
          }
        },
        getData: async (request) => {
          return data
        },
        setData: async (request, dataToSet) => {
          hoek.merge(data, dataToSet, { mergeArrays: false })
          console.log(data)
        },
        getNextPath: async (request) => '/',
        pageDefinition: require('./test-harness-page')
      }
    }
  })

  return server
}

createServer()
  .then(server => server.start())
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
