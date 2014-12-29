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
        _.noop,
        function( err ) {
            // TODO Send normalized error message
            res
                .status( err.code )
                .json( {
                    code:    err.code,
                    status:  'INTERNAL SERVER ERROR',
                    message: err.message,
                    data:    {}
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
