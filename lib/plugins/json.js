'use strict';

/**
 * JSON plugin
 * @returns {Function}
 */
function json() {

    /**
     * @scope {Resource}
     * @param {Object} req
     * @param {Object} res
     * @returns {*}
     */
    return function( req, res ) {
        return res.json( this.body() );
    };

}

module.exports = json;
