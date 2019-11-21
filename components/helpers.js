const joi = require('@hapi/joi')

function buildSchema (type, keys) {
  let schema = type.isJoi ? type : joi[type]()

  Object.keys(keys).forEach(key => {
    const val = keys[key]
    schema = schema[key](typeof val === 'boolean' ? undefined : val)
  })

  return schema
}

function buildFormSchema (schemaType, component, isRequired = true) {
  const definedSchema = component.schema || {}

  let schema = schemaType.isJoi ? schemaType : joi[schemaType]()
  Object.keys(definedSchema).forEach(key => {
    const val = definedSchema[key]
    schema = schema[key](typeof val === 'boolean' ? undefined : val)
  })

  if (isRequired) {
    schema = schema.required()
  }

  if (component.title) {
    schema = schema.label(component.title)
  }

  if (component.options.required === false) {
    schema = schema.allow('')
  }

  if (schema.trim && component.schema.trim !== false) {
    schema = schema.trim()
  }

  return schema
}

function getFormSchemaKeys (name, schemaType, component) {
  const schema = buildFormSchema(schemaType, component)

  return { [component.name]: schema }
}

module.exports = {
  buildSchema,
  buildFormSchema,
  getFormSchemaKeys
}
