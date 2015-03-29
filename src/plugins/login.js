import _ from 'lodash'
import B from 'bluebird'
import passport from 'passport'
import RESTError from '../rest/error'

let usage = 0

/**
 * Login plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function login( route, opts ) {
  usage += 1
  if (usage > 1) {
    throw 'Login plugin can only be used once'
  }

  opts = _.extend( {
    session:  false,
    strategy: ['bearer', 'local', 'basic']
  }, opts )

  return function( req, res ) {
    let deferred = B.pending()

    passport.authenticate(
      opts.strategy,
      {session: opts.session},
      function( err, user ) {
        if (err) {
          return deferred.reject( new RESTError( err.message, 500 ) )
        }
        if (!user) {
          return deferred.reject( new RESTError( 'User not found', 404 ) )
        }

        res.body = user
        req.user = user

        deferred.resolve()
      } )( req, res )

    return deferred.promise
  }
}

export default login
