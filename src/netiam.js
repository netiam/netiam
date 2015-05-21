import _ from 'lodash'
import plugins from './plugins/index'

export default function netiam() {
  const stack = []

  function dispatch(req, res) {
    let p = Promise.resolve()

    stack.forEach(function(call) {
      p = p.then(function() {
        return call(req, res)
      })
    })

    return p
  }

  const dispatcher = function(req, res) {
    dispatch(req, res)
      .catch(err => {
        if (err.nonce) {
          return
        }

        res
          .status(err.code || 500)
          .json({
            status: err.status || 'INTERNAL SERVER ERROR',
            message: err.message || 'Undefined Error',
            data: err.data || undefined
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
