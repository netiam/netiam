'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

function Data( data ) {
    Plugin.call( this, 'data', Plugin.PRIORITY_LOW );
    this.data = data;
}

util.inherits( Data, Plugin );

/**
 * Dispatch
 * @params {Resource} resource
 */
Data.prototype.dispatch = function dispatch( resource ) {
    resource.body( this.data );
};

module.exports = function( data ) {
    return new Data( data );
};
