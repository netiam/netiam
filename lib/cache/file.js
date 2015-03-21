'use strict';

/**
 * Cache
 * @param {Object} config
 * @param {String} config.path
 * @returns {{has: has, load: load, save: save}}
 */
module.exports = function( config ) {
    var fs = require( 'fs' ),
        path = require( 'path' ),
        mkdirp = require( 'mkdirp' ),
        base = path.resolve( config.path );

    // Create cache dir
    mkdirp( base, function( err ) {
        if (err) {
            console.error( err );
        }
    } );

    /**
     * Get cache path
     * @param {String} id
     * @returns {String}
     */
    function get( id ) {
        return path.resolve( base, id );
    }

    /**
     * Get cache stat
     * @param {String} id
     * @param {Function} cb
     */
    function stat( id, cb ) {
        has( id, function( exists ) {
            if (!exists) {
                return cb( new Error( 'Cache entry does not exist: "' + id + '"' ) );
            }

            fs.stat( get( id ), cb );
        } );
    }

    /**
     * Has cache entry
     * @param {String} id
     * @param {Function} cb
     */
    function has( id, cb ) {
        fs.exists( get( id ), cb );
    }

    /**
     * Load cache entry
     * @param {String} id
     * @param {Function} cb
     */
    function load( id, cb ) {
        has( id, function( exists ) {
            if (!exists) {
                return cb( new Error( 'Cache entry does not exist: "' + id + '"' ) );
            }

            fs.readFile( get( id ), cb );
        } );
    }

    /**
     * Save cache entry
     * @param {String} id
     * @param {String} data
     * @param {Function} cb
     */
    function save( id, data, cb ) {
        fs.writeFile( get( id ), data, cb );
    }

    return {
        has:  has,
        stat: stat,
        load: load,
        save: save
    };
};
