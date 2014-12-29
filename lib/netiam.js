'use strict';

var Resource = require( './resource' );

Resource.plugin( 'rest', require( './plugins/rest' ) );
Resource.plugin( 'data', require( './plugins/data' ) );
Resource.plugin( 'json', require( './plugins/json' ) );
Resource.plugin( 'transform', require( './plugins/transform' ) );

/**
 * Dispatch resource
 * @param {String} verb
 * @param {Resource} resource
 * @returns {Function}
 */
function dispatch( verb, resource ) {
    return function( req, res ) {
        resource.dispatch( verb, req, res );
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
            var resource = new Resource();
            app.head( route, dispatch( 'HEAD', resource ) );
            return resource;
        },

        /**
         * GET request
         * @param route
         */
        get: function( route ) {
            var resource = new Resource();
            app.get( route, dispatch( 'GET', resource ) );
            return resource;
        },

        /**
         * POST request
         * @param route
         */
        post: function( route ) {
            var resource = new Resource();
            app.post( route, dispatch( 'POST', resource ) );
            return resource;
        },

        /**
         * PUT request
         * @param route
         */
        put: function( route ) {
            var resource = new Resource();
            app.put( route, dispatch( 'PUT', resource ) );
            return resource;
        },

        /**
         * DELETE request
         * @param route
         */
        delete: function( route ) {
            var resource = new Resource();
            app.delete( route, dispatch( 'DELETE', resource ) );
            return resource;
        }
    };

}

module.exports = netiam;
