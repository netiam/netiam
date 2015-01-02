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
     * @param {Object} req
     * @param {Object} res
     * @returns {*}
     */
    return function( req, res ) {
        res.body = body;
    };

}

module.exports = data;
