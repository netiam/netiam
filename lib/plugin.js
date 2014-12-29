'use strict';

var util   = require( 'util' ),
    events = require( 'events' );

/**
 * Plugin
 * @constructor
 * @param {String} name
 * @param {Number} [priority=50]
 */
function Plugin( name, priority, opts ) {
    priority = priority || 50;

    events.EventEmitter.call( this );

    this._name = name;
    this._prio = priority;
    this.resource( opts.resource );
}

util.inherits( Plugin, events.EventEmitter );

// priority constants
Plugin.PRIORITY_HIGHER = 80;
Plugin.PRIORITY_HIGH = 75;
Plugin.PRIORITY_NORMAL = 50;
Plugin.PRIORITY_LOW = 25;

/**
 * Priority getter/setter
 * @param {Number} [value]
 * @returns {Number}
 */
Plugin.prototype.priority = function priority( value ) {
    if (value) {
        this._prio = value;
    }
    return this._prio;
};

/**
 * Resource getter/setter
 * @param {Resource} [value]
 * @returns {Resource}
 */
Plugin.prototype.resource = function resource( value ) {
    if (value) {
        this._resource = value;
    }
    return this._resource;
};

module.exports = Plugin;
