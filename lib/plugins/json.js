'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

function Json() {
    Plugin.call( this, 'json', Plugin.PRIORITY_LOW );
}

util.inherits( Json, Plugin );

/**
 * Dispatch
 * @params {Resource} resource
 */
Json.prototype.dispatch = function dispatch( resource ) {
    this.resource = resource;
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
        res.json( this.resource.body() );
    } );
    return json;
};
