'use strict';

var _    = require( 'lodash' ),
    path = require( 'path' );

/**
 * Profile plugin
 * @param {Object} opts
 * @returns {Function}
 */
function profile( opts ) {
    opts = _.extend( {
        query:   'profile',
        basedir: './models'
    }, opts );

    /**
     * @scope {Resource}
     * @param {Object} req
     * @returns {mixed}
     */
    return function( req ) {
        var file,
            schema;

        if (req.query[opts.query] !== 'default') {
            // TODO Load profiles during start time
            file =
                path.join(
                    path.dirname( require.main.filename ),
                    opts.basedir,
                    this.model().modelName.toLowerCase() +
                    '.profile.' +
                    req.query[opts.query] +
                    '.json'
                );
            try {
                schema = require( file );
            } catch (err) {
                return console.error( err );
            }
            this.body( _.pick( this.body(), schema ) );
        }
    };

}

module.exports = profile;
