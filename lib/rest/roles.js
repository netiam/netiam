'use strict';

var _         = require( 'lodash' ),
    Role      = require( './models/role' ),
    documents = [
        {
            '_id':         '53ff92f6dc52d7472e074815',
            'name':        'GUEST',
            'description': 'If not logged in, every user is a guest.'
        },
        {
            '_id':         '53ff92f6dc52d7472e074816',
            'name':        'USER',
            'description': 'Every user inherits from this role.'
        },
        {
            '_id':         '53ff92f6dc52d7472e074817',
            'name':        'MANAGER',
            'description': 'Petsitters are like regular users, but they have their petsitting tools.',
            'parent':      '53ff92f6dc52d7472e074816'
        },
        {
            '_id':         '53ff92f6dc52d7472e074818',
            'name':        'ADMIN',
            'superuser':   true,
            'description': 'System administrators.'
        }
    ],
    roles     = [],
    ids       = {},
    names     = {};

/**
 * Normalize role input as string
 * @param {String} role
 * @returns {Object} The normalized role
 */
function normalizeString( role ) {
    // Evaluate as ID
    if (ids[role]) {
        return ids[role];
    }
    // Evaluate as name
    if (names[role.toUpperCase()]) {
        return names[role.toUpperCase()];
    }

    // Return guest
    return names.GUEST;
}

/**
 * Normalize role input as object
 * @param {String} role
 * @returns {Object} The normalized role
 */
function normalizeObject( role ) {
    // Evaluate as native MongoDB ObjectID
    if (role.toString && ids[role.toString()]) {
        return ids[role.toString()];
    }

    // Evaluate as object with id.toString()
    if (role._id && role._id.toString && ids[role._id.toString()]) {
        return ids[role._id.toString()];
    }

    // Evaluate as object with id
    if (role._id && ids[role._id]) {
        return ids[role._id];
    }

    // Evaluate as object with name
    if (role.name && names[role.name]) {
        return names[role.name];
    }

    // Return guest
    return names.GUEST;
}

/**
 * Normalize input values and returns the specified role
 * @param {String|Object} role
 * @returns {Object} The normalized role
 */
function normalize( role ) {
    if (!role) {
        throw 'Invalid role: ' + role;
    }

    if (!roles) {
        throw 'Roles middleware is not ready';
    }

    if (_.isString( role )) {
        return normalizeString( role );
    }

    if (_.isObject( role )) {
        return normalizeObject( role );
    }

    // Return guest
    return names.GUEST;
}

/**
 * Get role by ID, name or the role object itself.
 * Use this method to normalize access to roles.
 * @param {String|Object} role
 * @return {Object}
 */
function get( role ) {
    try {
        return normalize( role );
    } catch (err) {
        console.error( err );
    }
    return null;
}

/**
 * Add role
 * @param {String} role
 * @param {String} [parent]
 * @returns {Object}
 */
function add( role, parent ) {
    var r = new Role( {
        name:   role,
        parent: parent ? get( parent ) : null
    } );

    names[role] = r;

    return r;
}

// fetch roles from db
roles = roles.concat( documents );

// Create mappings
roles.forEach( function( role ) {
    ids[role._id] = role;
    names[role.name] = role;
} );

/**
 * Is role already registered
 * @param {String|Object} role
 * @returns {Boolean}
 */
function has( role ) {
    if (get( role )) {
        return true;
    }
    return false;
}

module.exports = {
    add: add,
    has: has,
    get: get
};
