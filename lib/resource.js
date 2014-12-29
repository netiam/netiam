'use strict';

var _ = require( 'lodash' ),
    Q = require( 'q' );

/**
 * Resource
 * @constructor
 */
function Resource() {
    this._stack = [];
}

/**
 * Getter/Setter body
 * @param {Object} body
 * @returns {Object}
 */
Resource.prototype.body = function( body ) {
    if (body) {
        this._body = body;
    }
    return this._body;
};

/**
 * Getter/Setter model
 * @param {Function} model
 * @returns {Function}
 */
Resource.prototype.model = function( model ) {
    if (model) {
        this._model = model;
    }
    return this._model;
};

/**
 * Dispatch
 * @param {Object} req
 * @param {Object} res
 */
Resource.prototype.dispatch = function( req, res ) {
    var that = this,
        q = Q.resolve( null );

    // Sequential
    this._stack.forEach( function( call ) {
        q = q.then( function() {
            return call.call( that, req, res );
        } );
    } );

    // resolve/reject
    q
        .then(
        function() {
            // Always answer requests
            if (!res.headersSent) {
                res
                    .status( 500 )
                    .json( {
                        code:    500,
                        status:  'INTERNAL SERVER ERROR',
                        message: 'Route did not send any response to client'
                    } );
            }
        },
        function( err ) {
            res
                .status( err.code )
                .json( {
                    code:    err.code || 500,
                    status:  err.status || 'INTERNAL SERVER ERROR',
                    message: err.message || '',
                    data:    err.data || {}
                } );
        } );
};

/**
 * Initialize plugin
 * @param {String} plugin
 * @param {Function} module
 */
Resource.plugin = function( plugin, module ) {
    if (!_.isFunction( module )) {
        console.error( 'Module does not export a function' );
    }

    // Add to prototype chain if not exists
    if (!Resource.prototype[plugin]) {
        Resource.prototype[plugin] = function() {
            this._stack.push(
                module.apply(
                    this,
                    arguments
                )
            );
            return this;
        };
    }
};

module.exports = Resource;
