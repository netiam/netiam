'use strict';

var Route = require( './route' );

// Register plugins
Route.plugin( 'acl', require( './plugins/acl' ) );
Route.plugin( 'data', require( './plugins/data' ) );
Route.plugin( 'json', require( './plugins/json' ) );
Route.plugin( 'profile', require( './plugins/profile' ) );
Route.plugin( 'rest', require( './plugins/rest' ) );
Route.plugin( 'transform', require( './plugins/transform' ) );

/**
 * Handle all requests and invoke route dispatch method
 * @param {Route} route
 * @returns {Function}
 */
function handle( route ) {
    /**
     * Route handle
     * @param {Object} req
     * @param {Object} res
     */
    return function( req, res ) {
        route.dispatch( req, res );
    };
}

/**
 * Create application
 * @param {*} app
 */
function netiam( app ) {

    /**
     * Request wrapper
     * @param method
     * @returns {Function}
     */
    function request( method ) {
        /**
         * Create route
         */
        return function( val ) {
            var route = new Route();
            app[method.toLowerCase()]( val, handle( route ) );
            return route;
        };
    }

    // Expose methods
    return {
        head:   request( 'HEAD' ),
        get:    request( 'GET' ),
        post:   request( 'POST' ),
        put:    request( 'PUT' ),
        delete: request( 'DELETE' )
    };

}

module.exports = netiam;
