'use strict';

var _ = require( 'lodash' ),
    Q = require( 'q' );

/**
 * Resource
 * @constructor
 */
function Resource() {
    this.stack = [];
}

/**
 * Getter/Setter body
 * @param {Object} data
 * @returns {Object}
 */
Resource.prototype.body = function( data ) {
    if (data) {
        this.data = data;
    }
    return this.data;
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
    this.stack.sort( function( a, b ) {
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
    _.forEach( this.stack, function( node ) {
        var module = node[0];
        module.emit( 'route', req, res );
        calls.push( module.dispatch( that, verb, req, res ) );
    } );

    Q
        .all( calls )
        .then(
        function() {
            _.forEach( that.stack, function( node ) {
                node[0].emit( 'done', req, res );
            } );
        },
        function( err ) {
            _.forEach( that.stack, function( node ) {
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
            opts = _.extend( opts, {} );
        }
        this.stack.push( [module( opts ), opts] );
        return this;
    };
};

module.exports = Resource;
