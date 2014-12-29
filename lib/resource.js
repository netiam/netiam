'use strict';

var _ = require( 'lodash' ),
    Q = require( 'q' );

/**
 * Resource
 * @param {Object} opts
 * @constructor
 */
function Resource( opts ) {
    this._stack = [];
    this._opts = _.extend( {}, opts );
    if (!this._opts.model) {
        throw 'Model is undefined';
    }
    this.model( this._opts.model );
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
 * @param {Object} model
 * @returns {Object}
 */
Resource.prototype.model = function( model ) {
    if (model) {
        this._model = model;
    }
    return this._model;
};

/**
 * Dispatch
 * @param {String} verb
 * @param {Object} req
 * @param {Object} res
 */
Resource.prototype.dispatch = function( verb, req, res ) {
    var calls = [],
        that = this;

    // Sort plugin stack by priority
    this._stack.sort( function( a, b ) {
        a = a[0];
        b = b[0];

        if (a.priority() > b.priority()) {
            return -1;
        }

        if (a.priority() < b.priority()) {
            return 1;
        }

        return 0;
    } );

    // Hooks
    _.forEach( this._stack, function( node ) {
        var module = node[0];
        module.emit( 'route', req, res );
        calls.push( module.dispatch( verb, req, res ) );
    } );

    Q
        .all( calls )
        .then(
        function() {
            _.forEach( that._stack, function( node ) {
                node[0].emit( 'done', req, res );
            } );
        },
        function( err ) {
            _.forEach( that._stack, function( node ) {
                node[0].emit( 'fail', err, req, res );
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

    Resource.prototype[plugin] = function( opts ) {
        if (!opts) {
            opts = _.extend( {
                resource:  this,
                model: this.model()
            }, opts );
        }
        this._stack.push( [module( opts ), opts] );
        return this;
    };
};

module.exports = Resource;
