const hapi = require('@hapi/hapi')
const hoek = require('@hapi/hoek')
const nunjucks = require('nunjucks')

const visionPlugin = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure(options.path, {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: [
      'views',
      'node_modules/govuk-frontend/govuk',
      'node_modules/govuk-frontend/govuk/components/',
      'test-harness'
    ],
    isCached: false,
    context: {
      appVersion: '0.0.1',
      assetPath: '/assets',
      serviceName: 'Digital form page test harness',
      pageTitle: 'Digital form page - GOV.UK',
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
      'digital-form-page': {
        pageTemplateName: 'layout.html',
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
