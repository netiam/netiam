'use strict';

var roles = require( './roles' );

/**
 * Acl owner assertion
 * @param {String} field
 * @param {String} value
 * @returns {Function} assertion function
 */
function owner( field, value ) {
    /**
     * @param {Acl} acl
     * @param {Object} resource
     * @param {Role} role
     * @param {String} privilege
     * @returns {Array} List of allowed keys
     */
    return function( acl, resource, role, privilege ) {
        var user;
        if (resource.hasOwnProperty( field )) {
            user = resource[field];
        }

        // Return early if user does now own resource
        if (user !== value) {
            return [];
        }
        return acl.keys( roles.get( 'OWNER' ), privilege );
    };
}

// Add role OWNER to allow checks against ACL's with owner assert
if (!roles.has( 'OWNER' )) {
    roles.add( 'OWNER' );
}

module.exports = {
    owner: owner
};
