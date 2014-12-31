'use strict';

var _ = require( 'lodash' ),
    Q = require( 'q' );

/**
 * Route
 * @constructor
 */
function Route() {
    this._stack = [];
    this._pre = {};
    this._post = {};
}

/**
 * Getter/Setter body
 * @param {Object} [body]
 * @returns {Object}
 */
Route.prototype.body = function( body ) {
    if (body) {
        this._body = body;
    }
    return this._body;
};

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
 * Getter/Setter user
 * @param {Object} [user]
 * @returns {Object}
 */
Route.prototype.user = function( user ) {
    if (user) {
        this._user = user;
    }
    return this._user;
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
 * @param {String} type
 * @param {String} name
 * @param {Object} req
 * @param {Object} res
 */
Route.prototype.hook = function( type, name, req, res ) {
    var that = this,
        q = Q.resolve( null );

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
};

/**
 * Dispatch
 * @param {Object} req
 * @param {Object} res
 */
Route.prototype.dispatch = function( req, res ) {
    var that = this;
    this
        // Pre dispatch
        .hook( 'pre', 'dispatch', req, res )

        // Stack
        .then( function() {
            return that.hook( 'stack', 'dispatch', req, res );
        } )

        // Post dispatch
        .then( function() {
            return that.hook( 'post', 'dispatch', req, res );
        } )

        // resolve/reject
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
