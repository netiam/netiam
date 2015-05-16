const lib = require('./lib/netiam')
const middleware = require('./lib/middleware')
const plugins = require('./lib/plugins')
const schemaPlugins = require('./lib/rest/schema/plugins')

lib.middleware = middleware
lib.plugins = plugins
lib.schema = {
  plugins: schemaPlugins
}

module.exports = lib
