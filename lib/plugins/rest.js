'use strict';

var _            = require( 'lodash' ),
    restResource = require( '../rest/resource' );

/**
 * REST plugin
 * @param {Route} route
 * @returns {Function}
 */
function rest( route, opts ) {
    var resource;
    opts = _.extend( {
        'idParam': 'id'
    }, opts );

    resource = restResource( opts );
    route.model( opts.model );

    /**
     * @scope {Resource}
     * @param {Object} req
     * @param {Object} res
     * @returns {*}
     */
    return function( req, res ) {
        var method = req.method;

        if (method === 'HEAD') {
            return resource
                .head( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }

        if (method === 'GET' && !req.params[opts.idParam]) {
            return resource
                .list( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }

        if (method === 'POST') {
            return resource
                .create( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }

        if (method === 'GET') {
            return resource
                .read( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }

        if (method === 'PUT') {
            return resource
                .update( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }

        if (method === 'DELETE') {
            return resource
                .delete( req, res )
                .then( function( document ) {
                    res.body = document;
                } );
        }
    };

}

module.exports = rest;
