'use strict';

/**
 * Data plugin
 * @param {Object} data
 * @returns {Function}
 */
function data( data ) {

    /**
     * @scope {Resource}
     * @returns {mixed}
     */
    return function() {
        return this.body( data );
    };

}

module.exports = data;
