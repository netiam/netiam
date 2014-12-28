'use strict';

var _   = require( 'lodash' ),
    Acl = require( './rest/acl' );

/**
 * Filters an object literal
 *
 * @param {Object} acl
 * @param {Object} data
 * @returns {Object}
 */
function filter( acl, data, role, privilege ) {
    acl = new Acl( acl );
    return _.pick( data, acl.allowed( role, privilege ) );
}

module.exports = {
    filter: filter
};
