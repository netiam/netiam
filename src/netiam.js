import isFunction from 'lodash/lang/isFunction'
import isObject from 'lodash/lang/isObject'
import forEach from 'lodash/collection/forEach'
import Promise from 'bluebird'

export default function({plugins = {}} = {}) {
  const stack = []

  function dispatch(req, res) {
    return stack.reduce((p, call) => {
      return p.then(() => {
        return call(req, res)
      })
    }, Promise.resolve())
  }

  const dispatcher = (req, res) => {
    return dispatch(req, res)
      .catch(err => {
        if (err.nonce) {
          return
        }

        res
          .status(err.status)
          .json({
            type: err.type,
            message: err.message,
            errors: isObject(err.data) ? err.data : undefined
          })
      })
  }

  function registerPlugin(plugin) {
    if (isFunction(plugin)) {
      return (...spec) => {
        stack.push(plugin(...spec))
        return dispatcher
      }
    }

    if (isObject(plugin)) {
      const container = {}
      forEach(plugin, (name, key) => {
        container[key] = (...spec) => {
          stack.push(name(...spec))
          return dispatcher
        }
      })

      return container
    }

    throw new Error(`The provided plugin has invalid type "${typeof plugin}"`)
  }

  // plugins
  function plugin(name, plugin) {
    if (dispatcher.hasOwnProperty(name)) {
      throw new Error(`The plugin with name ${name} is already registered or would overwrite a builtin method.`)
    }
    Object.defineProperty(dispatcher, name, {
      value: registerPlugin(plugin)
    })

    return dispatcher
  }

  Object.defineProperty(dispatcher, 'plugin', {
    value: plugin
  })

  forEach(plugins, (fn, name) => plugin(name, fn))

  return dispatcher
}
