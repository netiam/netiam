'use strict';

var _ = require( 'lodash' );

/**
 * Resource
 * @constructor
 */
function Resource() {
    this.stack = [];
}

/**
 * Getter/Setter body
 * @param body
 * @returns {Function}
 */
Resource.prototype.body = function( body ) {
    if (body) {
        this.body = body;
    }

    return this.body;
};

/**
 * Initialize plugin
 * @param {String} plugin
 * @param {Function} module
 */
Resource.plugin = function( plugin, module ) {
    if (!module) {
        try {
            module = require( './plugins/' + plugin );
        } catch (ex) {
            return console.error( 'Error loading plugin: ' + ex.message );
        }
    }

    if (!_.isFunction( module )) {
        console.error( 'Given module does not export a function' );
    }

    Resource.prototype[plugin] = function( opts ) {
        if (!opts) {
            opts = _.extend( opts, {} );
        }

        this.stack.push( [module, opts] );

        return this;
    };
};

module.exports = Resource;
