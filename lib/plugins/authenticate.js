'use strict';

var _             = require( 'lodash' ),
    passport      = require( 'passport' ),
    LocalStrategy = require( 'passport-local' ).Strategy,
    usage         = 0;

/**
 * Authentication plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function authenticate( route, opts ) {
    usage += 1;
    if (usage > 1) {
        return;
    }

    opts = _.extend( opts, {
        usernameField: 'email',
        passwordField: 'password'
    } );

    passport.serializeUser( function( user, done ) {
        done( null, user._id );
    } );

    passport.deserializeUser( function( id, done ) {
        opts.model.findById( id, function( err, user ) {
            done( err, user );
        } );
    } );

    passport.use( new LocalStrategy(
        opts,
        function( username, password, done ) {
            var credential = {};
            credential[opts.usernameField] = username;
            
            opts.model.findOne( credential, function( err, user ) {
                if (err) {
                    return done( err );
                }

                if (!user) {
                    return done( null, false, {message: 'Incorrect user'} );
                }
                // TODO implement password check
                if (password === password) {
                    return done( null, user );
                }
            } );
        }
    ) );

}

module.exports = authenticate;
