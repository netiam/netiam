'use strict';

var util   = require( 'util' ),
    Plugin = require( '../plugin' );

function Transform( transform ) {
    Plugin.call( this, 'transform', Plugin.PRIORITY_LOW );
    this.transform = transform;
}

util.inherits( Transform, Plugin );

/**
 * Dispatch
 * @params {Resource} resource
 */
Transform.prototype.dispatch = function( resource, verb, req, res ) {
    this.transform.call( this, resource, verb, req, res );
};

module.exports = function( transform ) {
    return new Transform( transform );
};
