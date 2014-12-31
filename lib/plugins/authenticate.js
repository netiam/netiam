'use strict';

var passport = require( 'passport' );

/**
 * Authentication plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function authenticate( route, opts ) {

    passport.serializeUser( function( user, done ) {
        done( null, user._id );
    } );

    passport.deserializeUser( function( id, done ) {
        opts.model.findById( id, function( err, user ) {
            done( err, user );
        } );
    } );

    route.pre( 'dispatch', function() {
    } );

}

module.exports = authenticate;
