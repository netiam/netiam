'use strict';

var _              = require( 'lodash' ),
    passport       = require( 'passport' ),
    LocalStrategy  = require( 'passport-local' ).Strategy,
    BasicStrategy  = require( 'passport-http' ).BasicStrategy,
    DigestStrategy = require( 'passport-http' ).DigestStrategy,
    BearerStrategy = require( 'passport-http-bearer' ).Strategy,
    usage          = 0;

/**
 * Authentication plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function authenticate( route, opts ) {
    /**
     * Handle
     * @param {String} username
     * @param {String} password
     * @param {Function} done
     */
    function handle( username, password, done ) {
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

    passport.use( new BasicStrategy( opts, handle ) );
    passport.use( new DigestStrategy( opts, handle ) );
    passport.use( new LocalStrategy( opts, handle ) );
    passport.use( new BearerStrategy( opts, handle ) );
}

module.exports = authenticate;
