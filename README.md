# digital-form-page

The **digital-form-page** is a plugin for [Hapi](https://hapi.dev/) that provides a configuration-driven
approach to implementing simple pages using the [GOV.UK Design System](https://design-system.service.gov.uk/).

It is based on the original work for the [digital-form-builder](https://github.com/DEFRA/digital-form-builder).

The [API documentation](API.md) contains details of how to configure the plugin.

## Prerequisites

This plugin is for use inside a Hapi digital application.  To use it, you will need to create an application
based on the following:
- [Node.js](https://nodejs.org) version 10 or higher
- [Hapi](https://hapi.dev/) version 18.4 or higher
- The Hapi [Vision](https://github.com/hapijs/vision) plugin version 5, configured to use:
  - [Nunjucks](https://mozilla.github.io/nunjucks/) version 3
  - The [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend) version 3

## Setup

To use this plugin in your application, simply

> `npm install @envage/digital-form-page`

Register the plugin with your Hapi server, as with any other plugin

> `await server.register(require('@envage/digital-form-page'))`

This adds a custom `digital-form-page` handler to your server that you can use in your routes

> ```js
>  server.route({
>    method: ['GET', 'POST'],
>    path: '/',
>    handler: {
>      'digital-form-page': {
>        pageDefinition,
>        getData,
>        setData,
>        getNextPath,
>      }
>    }
>  })
> ```

For pages to be correctly served, you will also have to perform setup of Vision, Nunjucks and the GOV.UK Frontend.
Details on this are in the [API documentation](API.md).

### Development and Test

When developing this plugin, simply clone this repository

`git clone https://github.com/DEFRA/digital-form-page.git`

and run

`npm install`

## Running in development

The project includes a test harness that shows the different form components on a single page. This can be run using

`npm run test-harness`

and then navigating in your browser to http://localhost:3000

## Running tests

Unit tests can be run using

`npm run unit-test`

## Contributing to this project

If you have an idea you'd like to contribute please log an issue.

All contributions should be submitted via a pull request.

Note that we use [Standard JS](https://standardjs.com/) style, you can check your code using

> `npm run lint`

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.