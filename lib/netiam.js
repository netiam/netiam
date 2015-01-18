'use strict';

var route = require( './route' );

/**
 * Create application
 * @param {*} app
 */
function netiam( app ) {

    /**
     * Request
     * @param {String} method
     * @returns {Function}
     */
    function request( method ) {
        /**
         * Create route
         * @params {String} val
         */
        return function( val ) {
            var r = route( app );
            app[method.toLowerCase()]( val, r );
            return r;
        };
    }

    /**
     * Middleware
     * @param {Object} req
     * @param {Object} res
     * @returns {route}
     */
    var middleware = function() {
        return route( app );
    };

    // Export
    return {
        // Middleware
        middleware: middleware,
        // Requests
        head:       request( 'HEAD' ),
        get:        request( 'GET' ),
        post:       request( 'POST' ),
        put:        request( 'PUT' ),
        delete:     request( 'DELETE' )
    };
}

module.exports = netiam;
