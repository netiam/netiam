'use strict';

var util   = require( 'util' ),
    events = require( 'events' );

/**
 * Plugin
 * @constructor
 * @param {String} name
 * @param {Number} [priority=50]
 */
function Plugin( name, priority ) {
    priority = priority || 50;

    events.EventEmitter.call( this );

    this.name = name;
    this.prio = priority;
}

util.inherits( Plugin, events.EventEmitter );

// priority constants
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
        this.prio = value;
    }
    return this.prio;
};

/**
 * Resource getter/setter
 * @param {Resource} [value]
 * @returns {Resource}
 */
Plugin.prototype.resource = function resource( value ) {
    if (value) {
        this.resource = value;
    }
    return this.resource;
};

module.exports = Plugin;
