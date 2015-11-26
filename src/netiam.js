import _ from 'lodash'
import dbg from 'debug'
import plugins from './plugins/index'
import Promise from 'bluebird'

const debug = dbg('netiam:dispatch')

export default function netiam() {
  const stack = []

  function dispatch(req, res) {
    return _.reduce(stack, function(p, call) {
      return p.then(function() {
        return call(req, res)
      })
    }, Promise.resolve())
  }

  const dispatcher = function(req, res) {
    dispatch(req, res)
      .catch(err => {
        if (err.nonce) {
          return
        }

        debug(err)

        res
          .status(err.code || 500)
          .json({
            status: err.status || 'INTERNAL SERVER ERROR',
            message: err.message || 'Undefined Error',
            errors: _.isObject(err.data) ? err.data : undefined
          })
      })
  }

  function registerPlugin(plugin) {
    if (_.isFunction(plugin)) {
      return (...spec) => {
        stack.push(plugin(...spec))
        return dispatcher
      }
    }

    if (_.isObject(plugin)) {
      const container = {}

      _.forEach(plugin, function(name, key) {
        container[key] = (...spec) => {
          stack.push(name(...spec))
          return dispatcher
        }
      })

      return container
    }
  }

  // plugins
  _.forEach(plugins, function(plugin, name) {
    dispatcher[name] = registerPlugin(plugin)
  })

  return Object.freeze(dispatcher)
}
