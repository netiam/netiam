'use strict';

var _    = require( 'lodash' ),
    path = require( 'path' );

/**
 * Profile plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function profile( route, opts ) {
    opts = _.extend( {
        query:   'profile',
        basedir: './models'
    }, opts );

    /**
     * @scope {Resource}
     * @param {Object} req
     * @returns {*}
     */
    return function( req ) {
        var file,
            schema;

        if (req.query[opts.query] && req.query[opts.query] !== 'default') {
            // TODO Load profiles during start time
            file =
                path.join(
                    path.dirname( require.main.filename ),
                    opts.basedir,
                    route.model().modelName.toLowerCase() +
                    '.profile.' +
                    req.query[opts.query] +
                    '.json'
                );
            try {
                schema = require( file );
            } catch (err) {
                return console.error( err );
            }
            route.body( _.pick( route.body(), schema ) );
        }
    };

}

module.exports = profile;
