'use strict';

/**
 * ACL plugin
 * @param {Object} opts
 * @returns {Function}
 */
function acl( opts ) {

    /**
     * @scope {Resource}
     * @param {Object} req
     * @param {Object} res
     * @returns {mixed}
     */
    return function( req, res ) {
        return true;
    };

}

module.exports = acl;
