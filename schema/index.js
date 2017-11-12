const Ajv = require('ajv')
const request = require('request-promise')

function Schema () {
  const ajv = Ajv({
    coerceTypes: true,
    allErrors: true,
    // verbose: true,
    useDefaults: true
  })

  const schemas = {}

  return {
    add (name, schema) {
      schemas[name] = ajv.compile(schema)
    },
    async validate (name, params) {
      const schema = schemas[name]
      if (!schema) {
        return Promise.reject(new Error(`schema ${name} does not exist`))
      }
      const validate = schema(params)
      if (!validate) {
        return Promise.reject(schema.errors)
      }
      return params
    },

    // Load the schema from a uri
    async addFromUrl (name, uri) {
      const schema = await request({
        uri,
        json: true
      })
      schemas[name] = ajv.compile(schema)
      return true
    }
  }
}

module.exports = Schema
