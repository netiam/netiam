'use strict';

var parser = require( './parser' ).parser,
    ast    = require( './ast' ),
    _      = require( 'lodash' ),
    identifier,
    expression;

// Set correct scope to parser
parser.yy = ast;

/**
 * Identifier
 * @param {ast.Expression|ast.Function|ast.Identifier|String|Number|Boolean|null} type
 * @param {*} type.id
 * @returns {*}
 */
identifier = function( type ) {
    if (type instanceof ast.Expression) {
        return expression( type );
    } else if (type instanceof ast.Function) {
        console.warn( 'Functions are not supported at the moment' );
        return true;
    } else if (type instanceof ast.Identifier) {
        return type.id;
    } else {
        return type;
    }
}

/**
 * Handle expression
 * @param {Object} expr
 * @param {String} expr.left
 * @param {String} expr.op
 * @param {String} expr.right
 * @returns {*}
 */
expression = function( expr ) {
    var lft = identifier( expr.left ),
        rgt = identifier( expr.right ),
        e;

    switch (expr.operator) {
        // Logical operators
        case 'and':
            return {$and: [lft, rgt]};
        case 'or':
            return {$or: [lft, rgt]};
        case 'not':
            throw 'Operator not implemented';
        case 'eq':
            e = {};
            e[lft] = rgt;
            return e;
        case 'ne':
            e = {};
            e[lft] = {$ne: rgt};
            return e;
        case 'gt':
            e = {};
            e[lft] = {$gt: rgt};
            return e;
        case 'ge':
            e = {};
            e[lft] = {$gte: rgt};
            return e;
        case 'lt':
            e = {};
            e[lft] = {$lt: rgt};
            return e;
        case 'le':
            e = {};
            e[lft] = {$lte: rgt};
            return e;
        // Search operators
        case 'lk':
            e = {};
            e[lft] = new RegExp( rgt, 'i' );
            return e;
    }
}

/**
 * Filter
 * @param {String} [query]
 * @constructor
 */
var Filter = function( query ) {
    this.q = query || '';
};

/**
 * Get expression
 * @returns {Object}
 */
Filter.prototype.toObject = function() {
    if (!this.q) {
        return {};
    }

    return expression( parser.parse( this.q ) );
};

/**
 * Add one or more conditions
 * @param {String|Object} q
 * @returns {Filter}
 */
Filter.prototype.where = function( q ) {
    // If no expression available, just apply hash
    if (!this.q && _.isString( q )) {
        this.q = q;
        return this;
    }

    // Apply AND operation for each key/value pair
    if (_.isObject( q )) {
        var ext = '';
        _.forEach( q, function( val, key ) {
            ext += key + ' EQ \'' + val + '\'';
        } );
        if (!this.q && ext) {
            this.q = ext;
        } else {
            this.q += ' AND ' + ext;
        }
    }

    return this;
};

/**
 * Logical expressions
 * @param q
 * @param op
 * @return Filter
 */
Filter.prototype.logical = function( q, op ) {
    if (!this.q) {
        this.q = q;
        return this;
    }

    this.q = this.q + ' ' + op + ' ';

    return this;
};

/**
 * Op: and
 * @param q
 * @return Filter
 */
Filter.prototype.and = function( q ) {
    return this.logical( q, 'and' );
};

/**
 * Op: or
 * @param q
 * @return Filter
 */
Filter.prototype.or = function( q ) {
    return this.logical( q, 'or' );
};

/**
 * Op: eq
 * @param q
 * @return Filter
 */
Filter.prototype.eq = function( q ) {
    return this.logical( q, 'eq' );
};

/**
 * Op: ne
 * @param q
 * @return Filter
 */
Filter.prototype.ne = function( q ) {
    return this.logical( q, 'ne' );
};

/**
 * Op: gt
 * @param q
 * @return Filter
 */
Filter.prototype.gt = function( q ) {
    return this.logical( q, 'gt' );
};

/**
 * Op: ge
 * @param q
 * @return Filter
 */
Filter.prototype.ge = function( q ) {
    return this.logical( q, 'ge' );
};

/**
 * Op: lt
 * @param q
 * @return Filter
 */
Filter.prototype.lt = function( q ) {
    return this.logical( q, 'lt' );
};

/**
 * Op: le
 * @param q
 * @return Filter
 */
Filter.prototype.le = function( q ) {
    return this.logical( q, 'le' );
};

// Export
module.exports = function( query ) {

    // If empty string, return early
    if (query.length === 0) {
        return new Filter();
    }

    // Expressions
    return new Filter( query );
};
