'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

/**
 * Profile
 * @param {Object} opts
 * @constructor
 */
function Profile( opts ) {
    Plugin.call( this, 'profile', Plugin.PRIORITY_LOW, opts );
}

util.inherits( Profile, Plugin );

/**
 * Dispatch
 */
Profile.prototype.dispatch = function() {
};

module.exports = function( opts ) {
    return new Profile( opts );
};
