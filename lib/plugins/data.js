'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

function Data( data ) {
    Plugin.call( this, 'data', Plugin.PRIORITY_LOW, data );
    this._body = data;
}

util.inherits( Data, Plugin );

/**
 * Dispatch
 * @params {Resource} resource
 */
Data.prototype.dispatch = function dispatch( resource ) {
    resource.body( this._body );
};

module.exports = function( data ) {
    return new Data( data );
};
