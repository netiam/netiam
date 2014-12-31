'use strict';

/**
 * Data plugin
 * @param {Route} route
 * @param {Object} data
 * @returns {Function}
 */
function data( route, body ) {

    /**
     * @scope {Resource}
     * @returns {*}
     */
    return function() {
        return route.body( body );
    };

}

module.exports = data;
