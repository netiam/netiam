'use strict';

/**
 * JSON plugin
 * @param {Route} route
 * @returns {Function}
 */
function json( route ) {

    route.post( 'dispatch', function( req, res ) {
        res.json( route.body() );
    } );

}

module.exports = json;
