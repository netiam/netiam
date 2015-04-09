import _ from 'lodash'
import B from 'bluebird'

let plugins = {}

/**
 * Route factory
 * @param {Object} app
 * @returns {Function}
 */
function route(app) {
  let stack = []
  let hooks = {
    pre: [],
    post: []
  }
  let r

  /**
   * Register a hook of type
   * @param {String} type
   * @param {String} hook
   * @param {Function} cb
   */
  function register(type, hook, cb) {
    if (!hooks[type].hasOwnProperty(hook)) {
      hooks[type][hook] = []
    }
    hooks[type][hook].push(cb)
  }

  /**
   * Pre hooks
   * @param {String} hook
   * @param {Function} cb
   */
  function pre(hook, cb) {
    register('pre', hook, cb)
  }

  /**
   * Post hooks
   * @param {String} hook
   * @param {Function} cb
   */
  function post(hook, cb) {
    register('post', hook, cb)
  }

  /**
   * Invoke hooks
   * @param {Function} q
   * @param {String} type
   * @param {String} name
   * @param {Object} req
   * @param {Object} res
   * @returns {Object}
   */
  function hook(q, type, name, req, res) {
    if (type === 'pre' || type === 'post') {
      if (_.isArray(hooks[type][name])) {
        hooks[type][name].forEach(function(call) {
          q = q.then(function() {
            return call.call(null, req, res)
          })
        })
      }
      return q
    }

    if (type === 'stack') {
      stack.forEach(function(call) {
        q = q.then(function() {
          return call.call(null, req, res)
        })
      })
      return q
    }

    return q
  }

  /**
   * Dispatch
   * @param {Object} req
   * @param {Object} res
   */
  function dispatch(req, res) {
    let q = B.resolve()

    // Pre dispatch
    q = hook(q, 'pre', 'dispatch', req, res)

    // Stack
    q = hook(q, 'stack', 'dispatch', req, res)

    // Post dispatch
    q = hook(q, 'post', 'dispatch', req, res)

    q = q.then(function() {
      // Always answer requests
      if (!res.headersSent) {
        res
          .status(500)
          .json({
            status: 'INTERNAL SERVER ERROR',
            message: 'Route did not send any response to client'
          })
      }
    })

    q.catch(function(err) {
      // FIXME We cannot escape promise chain, err.nonce is a workaround
      if (err.nonce) {
        return
      } else {
        res
          .status(err.code || 500)
          .json({
            status: err.status || 'INTERNAL SERVER ERROR',
            message: err.message || 'Server did not send any response to client',
            data: err.data || null
          })
      }
    })
  }

  /**
   * Register plugins
   * @param {Function} route
   */
  function registerPlugins(route) {
    _.forEach(plugins, function(module, name) {
      route[name] = function(...opts) {
        opts.unshift(route)
        let f = module.apply(null, opts) || _.noop
        stack.push(f)
        return route
      }
    })
  }

  // Export
  r = (req, res) => dispatch(req, res)

  // Hooks
  r.pre = pre
  r.post = post
  r.app = app
  // Plugins
  registerPlugins(r)
  // Return composed route
  return Object.freeze(r)
}

/**
 * Register plugin
 * @param {String} name
 * @param {Function} module
 */
function plugin(name, module) {
  if (!_.isFunction(module)) {
    throw 'Module does not export a function'
  }

  if (!plugins[name]) {
    plugins[name] = module
  }
}

// Register plugins
plugin('acl', require('./plugins/acl'))
plugin('authenticate', require('./plugins/authenticate'))
plugin('cache', require('./plugins/cache'))
plugin('data', require('./plugins/data'))
plugin('json', require('./plugins/json'))
plugin('login', require('./plugins/login'))
plugin('profile', require('./plugins/profile'))
plugin('rest', require('./plugins/rest'))
plugin('transform', require('./plugins/transform'))

export default route
