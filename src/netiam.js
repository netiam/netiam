import _ from 'lodash'
import acl from './plugins/acl'
import authenticate from './plugins/authenticate'
import cache from './plugins/cache'
import data from './plugins/data'
import graph from './plugins/graph'
import json from './plugins/json'
import jsonapi from './plugins/jsonapi'
import login from './plugins/login'
import map from './plugins/map'
import profile from './plugins/profile'
import render from './plugins/render'
import rest from './plugins/rest'
import transform from './plugins/transform'

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

  const o = function(req, res) {
    dispatch(req, res)
      .catch(err => {
        if (err.nonce) {
          return
        }
        console.error(err)
        console.error(err.stack)
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
        return o
      }
    }

    if (_.isObject(plugin)) {
      const container = {}

      _.forEach(plugin, function(name, key) {
        container[key] = (...spec) => {
          stack.push(name(...spec))
          return o
        }
      })

      return container
    }
  }

  // plugins
  o.acl = registerPlugin(acl)
  o.authenticate = registerPlugin(authenticate)
  o.cache = registerPlugin(cache)
  o.data = registerPlugin(data)
  o.graph = registerPlugin(graph)
  o.json = registerPlugin(json)
  o.jsonapi = registerPlugin(jsonapi)
  o.login = registerPlugin(login)
  o.map = registerPlugin(map)
  o.profile = registerPlugin(profile)
  o.render = registerPlugin(render)
  o.rest = registerPlugin(rest)
  o.transform = registerPlugin(transform)

  return Object.freeze(o)
}
