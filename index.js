const error = require('./lib/rest/error')
const lib = require('./lib/netiam')
const middleware = require('./lib/middleware')
const plugins = require('./lib/plugins')
const models = require('./lib/rest/models')
const RoleSchema = require('./lib/rest/schema/role')
const schemaPlugins = require('./lib/rest/schema/plugins')
const aclLoader = require('./lib/acl/loader')

lib.acl = {
  loader: aclLoader
}
lib.error = error
lib.middleware = middleware
lib.plugins = plugins
lib.models = models
lib.schema = {
  Role: RoleSchema,
  plugins: schemaPlugins
}

module.exports = lib
