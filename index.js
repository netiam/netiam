const error = require('./lib/rest/error')
const lib = require('./lib/netiam')
const middleware = require('./lib/middleware')
const plugins = require('./lib/plugins')
const Role = require('./lib/rest/schema/role')
const schemaPlugins = require('./lib/rest/schema/plugins')

lib.error = error
lib.middleware = middleware
lib.plugins = plugins
lib.schema = {
  Role: Role,
  plugins: schemaPlugins
}

module.exports = lib
