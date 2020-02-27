# Hapi Simple GOV.UK Question Page

The **hapi-govuk-question-page** module is a plugin for [Hapi](https://hapi.dev/) that provides a configuration-driven
approach to implementing simple pages using the [GOV.UK Design System](https://design-system.service.gov.uk/).

It is based on the original work for the [digital-form-builder](https://github.com/DEFRA/digital-form-builder).

The [API documentation](API.md) contains details of how to configure the plugin.

## Purpose

We have a wide range of services, many involving quite lengthy and complex interactions with our users.
As we break these interactions down into simple steps to make them as easy as possible to use,
we often end up with a service journey that includes a large number of quite simple
[question pages](https://design-system.service.gov.uk/patterns/question-pages).

This plugin is designed to help create those simple pages, by providing these two features:
  - A way to implement pages by just listing the components that need to appear on them and providing a minimal
    amount of configuration information.
  - A basic request handler that just deals with processing the page requests and validating the inputs.

Those features are already met by a combination of Nunjucks, the GOV.UK Design System and the Hapi request lifecycle,
but using them out of the box results in a lot of repeated, boilerplate code and templates.

The purpose of this plugin is to put all of that boilerplate into one place where it can be tested once and reused
multiple times.

## GOV.UK Design System components and patterns

The plugin provides an implementation of the Question Page pattern and *most* of the components and patterns from
the Design System. Those not included are:
 - Components such as the Back Link or Error Summary that are built into the page and do not need to be added
   separately.
 - The Accordian and Tabs components, as these are not *simple* question pages and would make the configuration
   probably more complex than the equivalent code.
 - Components and patterns such as the Panel, the Summary List, Confirmation Pages and Task List Pages that are not
   required for a Question Page.
 - Patterns such as National Insurance Numbers that we haven't found a need for yet.
 - Patterns such as Addresses and Confirm an Email Address that require more complex interaction design and
   functionality than a simple question page.

## Prerequisites

This plugin is for use inside a Hapi GOV.UK application.  To use it, you will need to create an application
based on the following:
- [Node.js](https://nodejs.org)
- [Hapi](https://hapi.dev/)
- The Hapi [Vision](https://github.com/hapijs/vision) plugin, configured to use:
  - [Nunjucks](https://mozilla.github.io/nunjucks/)
  - The [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend)

Specific versions of these dependencies are identified in the package.json.

## Setup

To use this plugin in your application, simply

> `npm install @envage/hapi-govuk-question-page`

Register the plugin with your Hapi server, as with any other plugin

> `await server.register(require('@envage/hapi-govuk-question-page'))`

This adds a custom `hapi-govuk-question-page` handler to your server that you can use in your routes

> ```js
>  server.route({
>    method: ['GET', 'POST'],
>    path: '/',
>    handler: {
>      'hapi-govuk-question-page': {
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

> `git clone https://github.com/DEFRA/hapi-govuk-question-page.git`

and run

> `npm install`

## Running in development

The project includes a test harness that shows the different form components on a single page.
This can be run using

> `npm run test-harness`

and then navigating in your browser to http://localhost:3000

## Running tests

Unit tests can be run using

> `npm run unit-test`

## Contributing to this project

If you have an idea you'd like to contribute please log an issue.

All contributions should be submitted via a pull request.

Note that we use [Standard JS](https://standardjs.com/) style, you can check your code using

> `npm run lint`

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.