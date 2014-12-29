'use strict';

var Resource = require( './resource' );

// Register plugins
Resource.plugin( 'acl', require( './plugins/acl' ) );
Resource.plugin( 'data', require( './plugins/data' ) );
Resource.plugin( 'json', require( './plugins/json' ) );
Resource.plugin( 'profile', require( './plugins/profile' ) );
Resource.plugin( 'rest', require( './plugins/rest' ) );
Resource.plugin( 'transform', require( './plugins/transform' ) );

/**
 * Handle all requests and invoke resource dispatch method
 * @param {Resource} resource
 * @returns {Function}
 */
function handle( resource ) {
    /**
     * Route handle
     * @param {Object} req
     * @param {Object} res
     */
    return function( req, res ) {
        resource.dispatch( req, res );
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
         * Create resource for route
         */
        return function( route ) {
            var resource = new Resource();
            app[method.toLowerCase()]( route, handle( resource ) );
            return resource;
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
