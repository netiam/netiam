'use strict';

var restResource = require( '../rest/resource' );

/**
 * REST plugin
 * @returns {Function}
 */
function rest( opts ) {
    var resource = restResource( opts );

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

        if (method === 'GET' && !req.params.id) {
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

        if (method === 'GET' && req.params.id) {
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
