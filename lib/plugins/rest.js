'use strict';

var util     = require( 'util' ),
    Plugin   = require( '../plugin' ),
    resource = require( '../rest/resource' );

function Rest( opts ) {
    Plugin.call( this, 'rest', Plugin.PRIORITY_NORMAL );
    this.resource = resource( opts );
}

util.inherits( Rest, Plugin );

/**
 * Dispatch
 * @param {Resource} resource
 * @param {Object} req
 * @param {Object} res
 */
Rest.prototype.dispatch = function dispatch( resource, verb, req, res ) {
    if (verb === 'HEAD') {
        return this.resource
            .head( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }

    if (verb === 'GET' && !req.params.id) {
        return this.resource
            .list( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }

    if (verb === 'POST') {
        return this.resource
            .create( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }

    if (verb === 'GET' && req.params.id) {
        return this.resource
            .read( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }

    if (verb === 'PUT') {
        return this.resource
            .update( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }

    if (verb === 'DELETE') {
        return this.resource
            .delete( req, res )
            .then( function( document ) {
                resource.body( document );
            } );
    }
};

module.exports = function( opts ) {
    return new Rest( opts );
};
