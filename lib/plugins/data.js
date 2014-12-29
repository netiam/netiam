'use strict';

/**
 * Data plugin
 * @param {Object} data
 * @returns {Function}
 */
function data( body ) {

    /**
     * @scope {Resource}
     * @returns {mixed}
     */
    return function() {
        return this.body( body );
    };

}

module.exports = data;
