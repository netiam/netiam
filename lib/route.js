'use strict';

var _ = require( 'lodash' ),
    Q = require( 'q' );

/**
 * Route
 * @param {Object} app
 * @constructor
 */
function Route( app ) {
    this.app = app;
    this._stack = [];
    this._pre = {};
    this._post = {};
}

/**
 * Getter/Setter model
 * @param {Function} [model]
 * @returns {Function}
 */
Route.prototype.model = function( model ) {
    if (model) {
        this._model = model;
    }
    return this._model;
};

/**
 * Pre hooks
 * @param {String} hook
 * @param {Function} cb
 */
Route.prototype.pre = function( hook, cb ) {
    if (!this._pre.hasOwnProperty( hook )) {
        this._pre[hook] = [];
    }
    this._pre[hook].push( cb );
};

/**
 * Post hooks
 * @param {String} hook
 * @param {Function} cb
 */
Route.prototype.post = function( hook, cb ) {
    if (!this._post.hasOwnProperty( hook )) {
        this._post[hook] = [];
    }
    this._post[hook].push( cb );
};

/**
 * Invoke hooks
 * @param {Function} q
 * @param {String} type
 * @param {String} name
 * @param {Object} req
 * @param {Object} res
 */
Route.prototype.hook = function( q, type, name, req, res ) {
    var that = this;

    if (type === 'pre') {
        if (_.isArray( this._pre[name] )) {
            this._pre[name].forEach( function( call ) {
                q = q.then( function() {
                    return call.call( that, req, res );
                } );
            } );
        }
        return q;
    }

    if (type === 'post') {
        if (_.isArray( this._post[name] )) {
            this._post[name].forEach( function( call ) {
                q = q.then( function() {
                    return call.call( that, req, res );
                } );
            } );
        }
        return q;
    }

    if (type === 'stack') {
        this._stack.forEach( function( call ) {
            q = q.then( function() {
                return call.call( that, req, res );
            } );
        } );
        return q;
    }

    return q;
};

/**
 * Dispatch
 * @param {Object} req
 * @param {Object} res
 */
Route.prototype.dispatch = function( req, res ) {
    var q = Q.fcall( function() {
    } );

    // Pre dispatch
    q = this.hook( q, 'pre', 'dispatch', req, res );

    // Stack
    q = this.hook( q, 'stack', 'dispatch', req, res );

    // Post dispatch
    q = this.hook( q, 'post', 'dispatch', req, res );

    q.catch( function( err ) {
        res
            .status( err.code || 500 )
            .json( {
                code:    err.code || 500,
                status:  err.status || 'INTERNAL SERVER ERROR',
                message: err.message || 'Server did not send any response to client',
                data:    err.data || null
            } );
    } );

    q.fin( function() {
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
    } );
};

/**
 * Initialize plugin
 * @param {String} plugin
 * @param {Function} module
 */
Route.plugin = function( plugin, module ) {
    if (!_.isFunction( module )) {
        console.error( 'Module does not export a function' );
    }

    // Add to prototype chain if not exists
    if (!Route.prototype[plugin]) {
        Route.prototype[plugin] = function() {
            var args,
                f;
            args = Array.prototype.slice.call( arguments );
            args.unshift( this );
            f = module.apply( null, args ) || _.noop;
            this._stack.push( f );
            return this;
        };
    }
};

module.exports = Route;
