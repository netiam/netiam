'use strict';

var _ = require( 'lodash' );

/**
 * Profile plugin
 * @param {Object} opts
 * @returns {Function}
 */
function profile( opts ) {
    opts = _.extend( {
        profile: 'default',
        basedir: './models'
    }, opts );

    /**
     * @scope {Resource}
     * @returns {mixed}
     */
    return function() {
        if (opts.profile !== 'default') {
            console.log( 'apply profile: ' + opts.profile );
        }
    };

}

module.exports = profile;
