'use strict';

var Resource = require( './resource' );

// Load plugins
Resource.plugin( 'data', require( './plugins/data' ) );
Resource.plugin( 'json', require( './plugins/json' ) );
Resource.plugin( 'profile', require( './plugins/profile' ) );
Resource.plugin( 'rest', require( './plugins/rest' ) );
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
         * @param {String} route
         * @param {Object} opts
         */
        head: function( route, opts ) {
            var resource = new Resource( opts );
            app.head( route, dispatch( 'HEAD', resource ) );
            return resource;
        },

        /**
         * GET request
         * @param {String} route
         * @param {Object} opts
         */
        get: function( route, opts ) {
            var resource = new Resource( opts );
            app.get( route, dispatch( 'GET', resource ) );
            return resource;
        },

        /**
         * POST request
         * @param {String} route
         * @param {Object} opts
         */
        post: function( route, opts ) {
            var resource = new Resource( opts );
            app.post( route, dispatch( 'POST', resource ) );
            return resource;
        },

        /**
         * PUT request
         * @param {String} route
         * @param {Object} opts
         */
        put: function( route, opts ) {
            var resource = new Resource( opts );
            app.put( route, dispatch( 'PUT', resource ) );
            return resource;
        },

        /**
         * DELETE request
         * @param {String} route
         * @param {Object} opts
         */
        delete: function( route, opts ) {
            var resource = new Resource( opts );
            app.delete( route, dispatch( 'DELETE', resource ) );
            return resource;
        }
    };

}

module.exports = netiam;
