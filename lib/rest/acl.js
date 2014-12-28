'use strict';

var _     = require( 'lodash' ),
    roles = require( './roles' );

/**
 * ACL
 * @param acl
 * @constructor
 */
function Acl( acl ) {
    // Wildcard
    this.wc = acl['*'];

    // Get clean ACL list (no wildcards)
    this.acl = acl;

    // Owner
    this.owner = null;
}

/**
 * Get allowed key for a specific role. This method does not traverse up
 * the inheritance chain of roles. It just matches against the current role.
 * TODO Add wildcard support
 * TODO Add support to recognize DENY, ALLOW order. DENY will overrule ALLOW by
 * default. TODO Populated properties: If a populated property is allowed,
 * check nested props too TODO Add support for nested structures (dot notation
 * "a.b.c" : "R") TODO Should be cached?
 * @param {Object} keys Current list of allowey keys
 * @param {Role} role The role you want to check for
 * @param {String} [privilege] Privilege that need to be checked, default is
 *     "R" -> READ
 * @returns {Array} A list of allowed keys
 */
Acl.prototype.roleAllowed = function( keys, role, privilege ) {
    privilege = privilege || 'R';

    // Wildcards
    if (this.wc && this.wc.ALLOW && this.wc.ALLOW[role]) {
        if (this.wc.ALLOW[role].indexOf( privilege ) !== -1) {
            keys = keys.concat( _.keys( this.acl ) );
        }
    }

    // Granular privileges
    _.each( this.acl, function( prop, key ) {
        // Not allowed by default
        var privileges;

        // ALLOW
        if (prop.ALLOW && prop.ALLOW[role]) {
            privileges = prop.ALLOW[role];
            if (privileges.indexOf( privilege ) !== -1) {
                keys.push( key );
            }
        }

        // DENY
        if (prop.DENY && prop.DENY[role]) {
            privileges = prop.DENY[role];
            if (privileges.indexOf( privilege ) !== -1) {
                _.remove( keys, function( node ) {
                    return node === key;
                } );
            }
        }
    } );

    // Remove wildcard key
    delete keys['*'];

    // Unique
    return _.uniq( keys );
};

/**
 * Get full hierarchy of role
 *
 * @param {Role} role
 * @returns {Array}
 * @private
 */
Acl.prototype._getRoleHierarchy = function( role ) {
    if (!role.parent) {
        return [roles.get( role )];
    }

    return [roles.get( role )].concat( this._getRoleHierarchy( role.parent ) );
};

/**
 * Returns a list of allowed keys for this resource, role and privilege.
 * Be aware of the fact that if a property is not defined within the JSON ACL,
 * it will not be recognized by the system.
 * This method will traverse up the inheritance chain of a role to find all
 * properties allowed.
 *
 * @params {Role} A valid role object
 * @params {String} [privilege] Privilege that need to be checked, default is
 *     "R" -> READ
 * @params {String} [isOwner] Wether the current user is owner of document or
 *     not
 * @returns {Array} List of allowed keys
 */
Acl.prototype.allowed = function( role, privilege, isOwner ) {
    var that,
        keys,
        userRoles;

    privilege = privilege || 'R';
    isOwner = isOwner || false;

    that = this;
    keys = [];
    role = roles.get( role );

    // Ger role hierarchy
    userRoles = this._getRoleHierarchy( role ).reverse();

    // If owner, add role to top
    if (isOwner) {
        userRoles.unshift( roles.get( 'OWNER' ) );
    }

    // Get keys for roles
    _.each( userRoles, function( role ) {
        keys = keys.concat( that.roleAllowed( keys, role.name, privilege ) );
    } );

    // Unique
    return _.uniq( keys );
};

// Export
module.exports = Acl;
