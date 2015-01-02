'use strict';

var _     = require( 'lodash' ),
    path  = require( 'path' ),
    Acl   = require( '../rest/acl' ),
    Roles = require( '../rest/roles' );

/**
 * Get role
 * @param {Object} user
 * @returns {Role}
 */
function role( user ) {
    var guest = Roles.get( 'GUEST' );

    if (!guest) {
        throw 'Role GUEST is not available';
    }

    if (!user || !user.role) {
        return guest;
    }

    return Roles.get( user.role ) || guest;
}

/**
 * Filters an object literal
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
        // Create
        if (req.method === 'POST' && req.is( 'json' )) {
            if (_.isArray( req.body )) {
                req.body = _.map( function( node ) {
                    return filter( routeAcl, node, role( req.user ), 'C' );
                } );
                return;
            }

            if (_.isObject( req.body )) {
                req.body = filter( routeAcl, req.body, role( req.user ), 'C' );
                return;
            }
        }

        // Update
        if (req.method === 'PUT' && req.is( 'json' )) {
            if (_.isArray( req.body )) {
                req.body = _.map( function( node ) {
                    return filter( routeAcl, node, role( req.user ), 'U' );
                } );
                return;
            }

            if (_.isObject( req.body )) {
                req.body = filter( routeAcl, req.body, role( req.user ), 'U' );
                return;
            }
        }
    } );

    // Output
    route.post( 'dispatch', function( req, res ) {
        if (_.isArray( res.body )) {
            res.body =
                _.map( res.body, function( node ) {
                    return filter( routeAcl, node, role( req.user ), 'R' );
                } );
            return;
        }

        if (_.isObject( res.body )) {
            res.body = filter( routeAcl, res.body, role( req.user ), 'R' );
            return;
        }
    } );

}

module.exports = acl;
