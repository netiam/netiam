'use strict';

var Resource = require( './resource' );

// Middleware
Resource.plugin( 'transform' );
Resource.plugin( 'json' );
Resource.plugin( 'data' );

/**
 * Dispatcher
 * @param {Resource} resource
 * @returns {Function}
 */
function dispatch( resource ) {
    return function( req, res ) {
        resource.stack.forEach( function( middleware ) {
            middleware[0].apply( resource, [resource, middleware[1], req, res] );
        } );
    };
}

/**
 * Create application
 * @param {*} app
 */
function netiam( app ) {

    return {
        /**
         * HEAD request
         * @param route
         */
        head: function( route ) {
            var res = new Resource();
            app.head( route, dispatch( res ) );
            return res;
        },

        /**
         * GET request
         * @param route
         */
        get: function( route ) {
            var res = new Resource();
            app.get( route, dispatch( res ) );
            return res;
        },

        /**
         * POST request
         * @param route
         */
        post: function( route ) {
            var res = new Resource();
            app.post( route, dispatch( res ) );
            return res;
        },

        /**
         * PUT request
         * @param route
         */
        put: function( route ) {
            var res = new Resource();
            app.put( route, dispatch( res ) );
            return res;
        },

        /**
         * DELETE request
         * @param route
         */
        delete: function( route ) {
            var res = new Resource();
            app.delete( route, dispatch( res ) );
            return res;
        }
    };

}

module.exports = netiam;
