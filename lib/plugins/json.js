'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

function Json( opts ) {
    Plugin.call( this, 'json', Plugin.PRIORITY_LOW, opts );
}

util.inherits( Json, Plugin );

/**
 * Dispatch
 */
Json.prototype.dispatch = function dispatch() {
};

module.exports = function( opts ) {
    var json = new Json( opts );
    json.on( 'fail', function( err, req, res ) {
        res
            .status( err.code )
            .json( {
                message: err.message
            } );
    } );
    json.on( 'done', function( req, res ) {
        res.json( this.resource().body() );
    } );
    return json;
};
