import _ from 'lodash'
import dbg from 'debug'
import plugins from './plugins/index'
import dbRef from './db'

const debug = dbg('netiam:dispatch')

export const db = dbRef

export default function netiam() {
  const stack = []

  function dispatch(req, res) {
    return _.reduce(stack, (p, call) => {
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

        debug(err)

        res
          .status(err.code || 500)
          .json({
            status: err.status || 'INTERNAL SERVER ERROR',
            message: err.message || 'Undefined Error',
            errors: _.isObject(err.data) ? err.data : undefined,
            stack: err.stack
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
      _.forEach(plugin, (name, key) => {
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
  _.forEach(plugins, (plugin, name) => {
    dispatcher[name] = registerPlugin(plugin)
  })

  return Object.freeze(dispatcher)
}
