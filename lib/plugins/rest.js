'use strict';

var _            = require( 'lodash' ),
    restResource = require( '../rest/resource' );

/**
 * REST plugin
 * @scope {Resource}
 * @returns {Function}
 */
function rest( opts ) {
    var resource;
    opts = _.extend( {
        'idParam': 'id'
    }, opts );
    resource = restResource( opts );

    // Extend route with model
    // jshint validthis:true
    this.model( opts.model );

    /**
     * @scope {Resource}
     * @param {Object} req
     * @param {Object} res
     * @returns {mixed}
     */
    return function( req, res ) {
        var that = this,
            method = req.method;

        if (method === 'HEAD') {
            return resource
                .head( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }

        if (method === 'GET' && !req.params[opts.idParam]) {
            return resource
                .list( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }

        if (method === 'POST') {
            return resource
                .create( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }

        if (method === 'GET') {
            return resource
                .read( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }

        if (method === 'PUT') {
            return resource
                .update( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }

        if (method === 'DELETE') {
            return resource
                .delete( req, res )
                .then( function( document ) {
                    that.body( document );
                } );
        }
    };

}

module.exports = rest;
