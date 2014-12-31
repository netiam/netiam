'use strict';

var _     = require( 'lodash' ),
    path  = require( 'path' ),
    Acl   = require( '../rest/acl' ),
    roles = require( '../rest/roles' );

/**
 * Filters an object literal
 *
 * @param {Acl} acl
 * @param {Object} resource
 * @param {Object} role
 * @param {String} [privilege='R']
 * @param {Function|Array} [asserts]
 * @returns {Object}
 */
function filter( acl, resource, role, privilege, asserts ) {
    privilege = privilege || 'R';
    asserts = asserts || [];

    return _.pick(
        resource,
        acl.allowed(
            resource,
            role,
            privilege,
            asserts
        )
    );
}

/**
 * ACL plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function acl( route, opts ) {
    var routeAcl,
        file;

    opts = _.extend( {
        basedir: './models'
    }, opts );

    file =
        path.join(
            path.dirname( require.main.filename ),
            opts.basedir,
            opts.model.modelName.toLowerCase() +
            '.acl.json'
        );
    routeAcl = new Acl( require( file ) );

    // Input
    route.pre( 'dispatch', function( req ) {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            return;
        }
        req.body = filter( routeAcl, req.body, roles.get( 'USER' ), 'U' );
    } );

    // Output
    route.post( 'dispatch', function() {
        route.body( filter( routeAcl, route.body(), roles.get( 'USER' ), 'R' ) );
    } );

}

module.exports = acl;
