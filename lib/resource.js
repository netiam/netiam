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
 * Dispatch
 * @param {Object} req
 * @param {Object} res
 */
Resource.prototype.dispatch = function( req, res ) {
    var that = this,
        q = Q.resolve( null );

    this._stack.forEach( function( call ) {
        q = q.then( function() {
            return call.call( that, req, res );
        } );
    } );

    q
        .then(
        function() {
            console.log( 'done' );
        },
        function( err ) {
            console.log( 'error' + err.message );
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
                    null,
                    arguments
                )
            );
            return this;
        };
    }
};

module.exports = Resource;
