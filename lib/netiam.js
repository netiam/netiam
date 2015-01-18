'use strict';

var _     = require( 'lodash' ),
    Route = require( './route' );

// Register plugins
Route.plugin( 'acl', require( './plugins/acl' ) );
Route.plugin( 'authenticate', require( './plugins/authenticate' ) );
Route.plugin( 'data', require( './plugins/data' ) );
Route.plugin( 'json', require( './plugins/json' ) );
Route.plugin( 'login', require( './plugins/login' ) );
Route.plugin( 'profile', require( './plugins/profile' ) );
Route.plugin( 'rest', require( './plugins/rest' ) );
Route.plugin( 'transform', require( './plugins/transform' ) );

/**
 * Create application
 * @param {*} [app]
 * @returns {Function}
 */
function netiam( app ) {
    return new Route( app ).dispatch;
}

module.exports = netiam;
