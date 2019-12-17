# Hapi Simple GOV.UK Question Page API

## Introduction

Using the **hapi-govuk-question-page** plugin mostly just requires [registering](#registration) it with your server,
but there are some other pre-requisites before you can start adding routes.

It should be used inside a GOV.UK application and so expects Vision view handlers to be configured to serve
the GOV.UK Design System components as well as the pages from the plugin itself.

Also, the plugin does not define entire GOV.UK pages, it expects you to already have a template for your application.
The pages it serves will inherit from the template that you specify.  If you do not specify a page template then it
will expect to find a template named `layout.html` in your configured Vision path.

## Application configuration
To configure your application to use the plugin, you need to do the following:

### 1. Configure Vision to use Nunjucks as the rendering engine

Vision can be configured to use any file extensions, but the **hapi-govuk-question-page** plugin uses Nunjucks so 
follows the community practice of using `.njk` as the file extension.
However, as it is also quite common practice to use `.html` for view files the plugin supports this as well.
So Vision can be configured to use either `.html` or `.njk`  as the default extension.

Example:
```js
await server.register(require('@hapi/vision'))
server.views({
  engines: {
    html: {
      compile: (src, options) => {
        const template = nunjucks.compile(src, options.environment)
        return (context) => {
          return template.render(context)
        }
      },
      prepare: (options, next) => {
        options.compileOptions.environment = nunjucks.configure(options.path)
        return next()
      }
    }
  },
  ...
})
```

### 2. Configure Vision to serve the **hapi-govuk-question-page** view

The **hapi-govuk-question-page** plugin needs to have its directory `node_modules/hapi-govuk-question-page` on the
Visio path so that it can use Vision's `h.view()` response toolkit extension to serve its page.

Example:
```js
await server.register(require('@hapi/vision'))
server.views({
  engines: { ... },
  path: [
    'node_modules/hapi-govuk-question-page'
  ]
})
```

### 3. Configure Nunjucks to use GOV.UK Frontend and **hapi-govuk-question-page** components

Nunjucks needs to be configured with the paths where it can find templates. This will need to include paths for
both GOV.UK Frontend and the **hapi-govuk-question-page** components.

In order for the plugin to find the GOV.UK Frontend components,
the module root needs to be exposed, so that the contents can be uniquely referenced as `govuk`.

The same approach is applied with **hapi-govuk-question-page** - expose the module root so that the contents can be
referenced using the `hapi-govuk-question-page` container.

Example:
```js
await server.register(require('@hapi/vision'))
server.views({
  engines: {
    html: {
      ...
      prepare: (options, next) => {
        options.compileOptions.environment = nunjucks.configure([
          'node_modules/govuk-frontend',
          'node_modules/hapi-govuk-question-page'
        ])
        return next()
      }
    }
  },
  ...
})
```

### Vision configuration

A complete Vision plugin configuration would look something like this:

```js
await server.register(require('@hapi/vision'))
server.views({
  engines: {
    html: {
      compile: (src, options) => {
        const template = nunjucks.compile(src, options.environment)
        return (context) => {
          return template.render(context)
        }
      },
      prepare: (options, next) => {
        options.compileOptions.environment = nunjucks.configure(['node_modules/govuk-frontend', ...options.path])
        return next()
      }
    }
  },
  path: [
    'node_modules/hapi-govuk-question-page',
    'your/template/path'
  ]
})
```

## Registration

Registration is simple:

`await server.register(require('@envage/hapi-govuk-question-page'))`

The plugin has no registration-time options and is defined using the `once` directive so any multiple attempts at
registration will just be ignored by the Hapi server.

This means that any plugins built on top of it that have it as a registration-time dependency can freely register it
as they need to.

## Handler

With the plugin registered on your server, you will be able to use the special handler type `hapi-govuk-question-page`
as with any other Hapi handler type:

```js
server.route({
  method: ['GET', 'POST'],
  path: '/',
  handler: {
    'hapi-govuk-question-page': { ... }
  }
})
```

The handler is configured with [handler options](#options).

## `options`
  - `pageDefinition` - required object that defines the contents of the page as specified
    by [page definition object](#pagedefinition).
  
  - `getData` - a function with signature `async function(request)` that is called by the handler in response to the
    given `request` and should return the data to be displayed on the page.
    - `request` - the Hapi `request` object received by the handler.
    - returns - an object with a key for each named form component. If nothing is returned or keys are
      missing then those fields will just be empty on the page.            
    
    This parameter is not required if the page does not display any dynamic data.
    
  - `setData` - a function with signature `async function(request, data)` that is called by the handler after
    successful submission of a valid form.
    The provided function should perform whatever tasks are necessary to update your application's data.
    - `request` - the Hapi `request` object received by the handler. This will always be a POST request.
    - `data` - an object containing the data to be set, with a key for each named form component.
    - returns - nothing, or a Joi validation result. If a Joi validation result is returned and it has an `error`
      property then the plugin will treat the POST request as having failed validation and will display the error
      messages from the `error` object.
    
    This parameter is not required if the page does not contain any form components or has no POST route defined.
    
  - `getConfig` - a function with signature `async function(request)` that is called by the handler in response to the
    given `request` and should return the request-specific configuration information for any components that support it.
    - `request` - the Hapi `request` object received by the handler.
    - returns - an object with a key for each named component that supports request-specific configuration.
      The behaviour when configuration is not provided is component-specific - see the documentation for the individual
      [page components](#components).            
    
    This parameter is not required if the page does not have any components that need request-specific configuration.
    
  - `nextPath` - a string that the handler will redirect the client to following successful completion of the page.
    
    Required if `getNextPath` is not specified and the page contains any form components or has a POST route defined.
    
  - `getNextPath` - a function with signature `function(request)` that will be called by the handler to determine the
    redirect path that will be sent to the client following successful completion of the page.
    - `request` - the Hapi `request` object received by the handler. This will always be a POST request.
    - returns - a string that the handler will redirect the client to. If nothing is returned (or a falsey value) then
      the handler will use the value of the `nextPath` option instead.        
    
    Required if `nextPath` is not specified and the page contains any form components or has a POST route defined.
    If neither value is provided then the submitted page will send a redirect to itself.
    
  - `pageTemplateName` - a string specifying the filename of an alternative page template to use, rather than the
    default `layout.html`.
      
## `pageDefinition`
  - `title` - the text to display as the heading on the page and also to use in the `<title>` element. If a page has
    a single form component and that is the first component on the page then the label of that component will be used
    as the title instead of this property.
  - `components` - a required array of [page components](#components). Components will be rendered on the page in the
    order that they appear in this array.

## Components
There are a number of different types of page component that broadly align with the GOV.UK Design System Components.

All components are defined as an object with keys:
  - `type` - required string corresponding to the type of component to display on the page.
  - `options` - optional object containing additional configuration. See the individual component descriptions for
    details.

### Form components
Form components capture information from a user and are rendered inside an HTML form.
The available `type` values for these are:
  - [TextField](#textfield-component)
  - [NumberField](#numberfield-component)
  - [NamesField](#namesfield-component)
  - [TelephoneNumberField](#telephonenumberfield-component)
  - [EmailAddressField](#emailaddressfield-component)
  - [MultilineTextField](#multilinetextfield-component)
  - [CharacterCountField](#charactercountfield-component)
  - [DatePartsField](#datepartsfield-component)
  - [SelectField](#selectfield-component)
  - [RadiosField](#radiosfield-component)
  - [YesNoField](#yesnofield-component)
  - [CheckboxesField](#checkboxesfield-component)
  - [CheckboxesWithTextField](#checkboxeswithtextfield-component)

Form components have four properties in addition to `type`:
  - `name` - required string name of the data item that the component is bound to.
    This is the key used in the `getData` and `setData` functions.
    This value must be unique within the list of components.
  - `title` - string title used as the label for the form component.
  - `titleForError` - optional string to use as the title/name for the component in error messages.
    This allows for more descriptive error messages.
    If not provided, the `title` property is used in error messages.
  - `hint` - optional string used to display hint text on the form component.

Form components generally all support the following in the `options` object:
  - `options`:
    - `required` - boolean specifying whether the data item is required, defaults to `true`.
      This value is ignored for certain form components that are always required, such as radio buttons.
    - `classes` - string to override the default CSS classes used on the form components.

As form components are used to handle data, they will often have the following property:
  - `schema` - an object that has specific properties to define the constraints for the data field.

### Html components
Some components only display simple HTML markup rather than providing input elements for data capture.
The available `type` values for these are:
  - [Para](#para-component)
  - [InsetText](#insettext-component)
  - [WarningText](#warningtext-component)
  - [Details](#details-component)
  - [Html](#html-component)
  - [DynamicHtml](#dynamichtml-component)

## `CharacterCountField` component
Text field that displays a multi-line input with a character count using the Character Count component.
Has the same properties as a [MultilineTextField](#multilinetextfield-component), but also:
  - `options`:
    - `threshold` - number - the completion percentage threshold at which to display the character count message.
  - `schema`:
    - `maxwords` - number - the number of words to allow. If specified, the `max` property is ignored.

Note that unlike the `TextField` and `MultilineTextField` components, the `CharacterCountField` does not restrict
what the user can enter into the field, instead using validation to notify them of the error.

## `CheckboxesField` component
List of check boxes using the Checkboxes component. Check box items are defined in a list object.
  - `options`:
    - `list` - required [list object](#list-object) that defines the radios to display.
    - `filterable` - boolean indicating that the list can be filtered with request-specific configuration.

If the checkboxes are filterable then the `getConfig` function can return an array called `filter` containing the list
of item values to include.  Note that if this results in a list of less than two items, the component will just display
the full list.

Example:
```js
server.route({
  method: 'GET',
  path: '/choices',
  handler: {
    'hapi-govuk-question-page': {
      pageDefinition: {
        components: [{
          type: 'CheckboxesField',
          name: 'choices',
          title: 'Select your choices',
          options: {
            filterable: true,
            list: {
              type: 'number',
              items: [{ value: 1, text: ' Choice 1' }, { value: 2, text: ' Choice 2' }, { value: 3, text: ' Choice 3' }]
            }
          }
        }]
      },
      getConfig: async (request) => {
        let filter = null
        const personType = await ... // Get value from data store
        if (personType === 1) { // A type 1 person only gets these two choices
          filter = [1, 3]
        }
        return {
          choices: { filter }
        }
      }
    }
  }
})
```

## `CheckboxesWithTextField` component
Uses the Checkboxes component, but adds an additional text field as conditional content that is revealed when the
corresponding check box is ticked.
Has the same options as the [CheckboxesField component](#checkboxesfield-component),
but instead of the list items having a `conditionalHtml` property,
they have a `conditionalTextField` property that is the same as a [TextField component](#textfield-component),
with the exception of `options.required` and `options.classes`.

## `DatePartsField` component
Date field using the Date Input component following the Dates pattern, with separate inputs for day, month and year.

The `getData` function should return this value as a Javascript date object - the component will take care of
splitting the date into the separate parts.

Similarly, when the plugin calls `setDate` it will provide the value as a full Javascript date object.

Example:
```js
server.route({
  method: 'GET',
  path: '/date-required',
  handler: {
    'hapi-govuk-question-page': {
      pageDefinition: {
        components: [
          { type: 'DatePartsField', title: 'Date required' name: 'dateRequired' },
          ... // other form components
        ]
      },
      getData: async (request) => {
        const storedDate = await ... // Get value from data store
        return {
          dateRequired: storedDate || new Date(),
          ... // data for other fields
        }
      },
      setData: async (request, data) => {
        const dateRequired = data.dateRequired
        const yearRequired = dateRequired.getFullYear()
        // ... check the year
      }
    }
  }
})
```

## `Details` component
Show/hide details section using the Details component.
  - `title` - string of raw HTML used in the "collapsed" form as the summary.
  - `content` - string of raw HTML used in the hidden details section.

## `DynamicHtml` component
Raw HTML markup that supports request-specific parameters.
  - `templateHtml` - string of raw HTML, with placeholders for parameter values written as `$PARAM$`.

The occurrences of `$PARAM$` in the HTML will be replaced, in order, by the array of `parameterValues` returned by the
`getConfig` function.

Example:
```js
server.route({
  method: 'GET',
  path: '/current-time',
  handler: {
    'hapi-govuk-question-page': {
      pageDefinition: {
        components: [{
          type: 'DynamicHtml',
          name: 'currentDateTimeHere',
          templateHtml: '<p>The current date and time here at <a href="$PARAM$">the hapi-govuk-question-page plugin</a> is $PARAM$</p>'
        }]
      },
      getConfig: async (request) => {
        return {
          currentDateTimeHere: {
            parameterValues: [request.url, new Date()]
          }
        }
      }
    }
  }
})
```

## `EmailAddressField` component
Text field that performs additional validation to ensure that the text entered is a valid email address format.
Has the same properties as a [TextField](#textfield-component), with additional:
  - `options`:
    - `autocomplete` - boolean, when `true` will set the autocomplete attribute on so that users can easily add their
      own email address.

## `Html` component
Raw HTML markup to include in the page.
  - `content` - string of raw HTML.

## `InsetText` component
Text using the Inset Text component.
  - `content` - string of text to display.

## `MultilineTextField` component
Text field that displays a multi-line input using the Textarea component.
Has the same properties as a [TextField](#textfield-component), but also:
  - `options`:
    - `rows` - number - the number of rows of text to display on the page.

## `NamesField` component
Text field that implements the Names pattern for full name.
Has the same properties as a [TextField](#textfield-component), with additional:
  - `options`:
    - `autocomplete` - boolean, when `true` will set the autocomplete attribute on so that users can easily add their
      own name.

## `NumberField` component
Text field that has a number input and checks that the text is a valid number.
  - `schema`:
    - `integer` - boolean - whether the input must be a whole number.
    - `min` - number - the minimum value to allow.
    - `max` - number - the maximum value to allow.
    - `greater` - number - values must be greater than this.
    - `less` - number - values must be less than this.

## `Para` component
A simple paragraph of text.
  - `content` - string of text.

## `RadiosField` component
A radios list using the Radios component.
  - `options`:
    - `list` - required [list object](#list-object) that defines the radios to display.
    - `bold` - boolean indicating whether to display the list items as bold (strong), defaults to false.
    - `filterable` - boolean indicating that the list can be filtered with request-specific configuration.

If the radios are filterable then the `getConfig` function can return an array called `filter` containing the list
of item values to include.  Note that if this results in a list of less than two items, the component will just display
the full list.

See the [CheckboxesField component](#checkboxesfield-component) for an example of using the filter.

## `SelectField` component
A select list using the Select component.
  - `options`:
    - `list` - required [list object](#list-object) that defines the items to display in the list.
    - `filterable` - boolean indicating that the list can be filtered with request-specific configuration.

If the select field is  filterable then the `getConfig` function can return an array called `filter` containing the list
of item values to include.  Note that if this results in a list of less than two items, the component will just display
the full list.

See the [CheckboxesField component](#checkboxesfield-component) for an example of using the filter.

## `TelephoneNumberField` component
Text field that follows the Telephone number pattern.
Has the same properties as a [TextField](#textfield-component), with additional:
  - `options`:
    - `autocomplete` - boolean, when `true` will set the autocomplete attribute on so that users can easily add their
      own telephone number.

## `TextField` component
Simple text field.
  - `schema`:
    - `max` - number - the maximum length of text to allow.
    - `trim` - boolean - whether to force whitespace trimming from the start and end of the text.

## `WarningText` component
Text using the Warning Text component.
  - `text` - string of text to display.
  - `summary` - optional string displayed as the icon fallback, defaults to `'Warning'`.

## `YesNoField` component
Side by side radio using the Radios component, with just Yes and No as options.
  - `options`:
    - `yesFirst` - optional boolean to control the order that Yes and No are displayed, default to `true`.

## `list` object
  - `type` - required data type of the list, can be `'string'`, `'number'` or `'boolean'`.
  - `items` - required array of items in the list, each of which is an object:
    - `value` - required data value for the item, must be of the specified `type`.
    - `text` - required string to display on the page for the item.
    - `description` - optional additional tet to display as a hint for the item.
    - `conditionalHtml` - optional conditional HTML to display when the list item is selected.
