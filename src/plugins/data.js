/**
 * Data plugin
 * @param {Route} route
 * @param {Object} data
 * @returns {Function}
 */
function data( route, body ) {

  /**
   * @scope {Resource}
   * @param {Object} req
   * @param {Object} res
   */
  return function( req, res ) {
    res.body = body
  }

}

export default data
