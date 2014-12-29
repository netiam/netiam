'use strict';

/**
 * ACL plugin
 * @returns {Function}
 */
function acl() {

    /**
     * @scope {Resource}
     * @returns {mixed}
     */
    return function() {
        return true;
    };

}

module.exports = acl;
