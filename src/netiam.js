import route from './route'

/**
 * Create application
 * @param {*} app
 */
function netiam(app) {

  /**
   * Request
   * @param {String} method
   * @returns {Function}
   */
  function request(method) {
    /**
     * Create route
     * @params {String} val
     */
    return function(val) {
      let r = route(app)
      app[method.toLowerCase()](val, r)
      return r
    }
  }

  /**
   * Middleware
   * @param {Object} req
   * @param {Object} res
   * @returns {route}
   */
  function middleware() {
    return route(app)
  }

  // Export
  return Object.freeze({
    // Middleware
    middleware: middleware,
    // Requests
    head: request('HEAD'),
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')
  })
}

export default netiam
