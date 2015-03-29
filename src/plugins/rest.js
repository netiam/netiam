import _ from 'lodash'
import restResource from '../rest/resource'

/**
 * REST plugin
 * @param {Route} route
 * @returns {Function}
 */
function rest( route, opts ) {
  opts = _.extend( {
    'idParam': 'id'
  }, opts )

  let resource = restResource( opts )
  route.model = opts.model

  /**
   * @scope {Resource}
   * @param {Object} req
   * @param {Object} res
   * @returns {*}
   */
  return function( req, res ) {
    let method = req.method

    if (method === 'HEAD') {
      return resource
        .head( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 200 )
        } )
    }

    if (method === 'GET' && !req.params[opts.idParam]) {
      return resource
        .list( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 200 )
        } )
    }

    if (method === 'POST') {
      return resource
        .create( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 201 )
        } )
    }

    if (method === 'GET') {
      return resource
        .read( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 200 )
        } )
    }

    if (method === 'PUT') {
      return resource
        .update( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 200 )
        } )
    }

    if (method === 'DELETE') {
      return resource
        .delete( req, res )
        .then( function( document ) {
          res.body = document
          res.status( 204 )
        } )
    }
  }

}

export default rest
