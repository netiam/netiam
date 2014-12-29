'use strict';

var util     = require( 'util' ),
    Plugin   = require( '../plugin' ),
    resource = require( '../rest/resource' );

function Rest( opts ) {
    Plugin.call( this, 'rest', Plugin.PRIORITY_HIGH, opts );
    this._rest = resource( opts );
}
util.inherits( Rest, Plugin );

/**
 * Dispatch
 * @param {String} verb
 * @param {Object} req
 * @param {Object} res
 */
Rest.prototype.dispatch = function dispatch( verb, req, res ) {
    var that = this;

    if (verb === 'HEAD') {
        return this._rest
            .head( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }

    if (verb === 'GET' && !req.params.id) {
        return this._rest
            .list( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }

    if (verb === 'POST') {
        return this._rest
            .create( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }

    if (verb === 'GET' && req.params.id) {
        return this._rest
            .read( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }

    if (verb === 'PUT') {
        return this._rest
            .update( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }

    if (verb === 'DELETE') {
        return this._rest
            .delete( req, res )
            .then( function( document ) {
                that.resource().body( document );
            } );
    }
};

module.exports = function( opts ) {
    return new Rest( opts );
};
