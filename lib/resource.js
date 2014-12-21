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
 * Initialize plugin
 * @param {String} plugin
 */
Resource.plugin = function( plugin ) {
    var module;
    try {
        module = require( './plugins/' + plugin );
    } catch (ex) {
        return console.error( 'Error loading plugin: ' + ex.message );
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
