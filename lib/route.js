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
 * Register a hook of type
 * @param {String} type
 * @param {String} hook
 * @param {Function} cb
 * @private
 */
Route.prototype._register = function( type, hook, cb ) {
    if (!this[type].hasOwnProperty( hook )) {
        this[type][hook] = [];
    }
    this[type][hook].push( cb );
};

/**
 * Pre hooks
 * @param {String} hook
 * @param {Function} cb
 */
Route.prototype.pre = function( hook, cb ) {
    this._register( '_pre', hook, cb );
};

/**
 * Post hooks
 * @param {String} hook
 * @param {Function} cb
 */
Route.prototype.post = function( hook, cb ) {
    this._register( '_post', hook, cb );
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

    if (type === 'pre' || type === 'post') {
        if (_.isArray( this['_' + type][name] )) {
            this['_' + type][name].forEach( function( call ) {
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
                    status:  'INTERNAL SERVER ERROR',
                    message: 'Route did not send any response to client'
                } );
        }
    } );

    return this;
};

/**
 * Initialize plugin
 * @param {String} plugin
 * @param {Function} module
 */
Route.plugin = function( plugin, module ) {
    if (!_.isFunction( module )) {
        throw 'Module does not export a function';
    }

    // Add to prototype chain if not exists
    if (!Route.prototype[plugin]) {
        Route.prototype[plugin] = function() {
            var args,
                f,
                cb,
                that = this;
            args = Array.prototype.slice.call( arguments );
            args.unshift( this );
            f = module.apply( null, args ) || _.noop;
            this._stack.push( f );

            return this;
        };
    }
};

/**
 * Factory
 * @param {Object} app
 * @returns {Function}
 */
function route( app ) {
    // Route is a valid callback
    var r = new Route( app );
    var f = function( req, res ) {
        r.dispatch( req, res );
    };
    f.__proto__ = r;
    return f;
};
route.plugin = Route.plugin;

module.exports = route;
