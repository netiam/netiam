'use strict';

var _ = require( 'lodash' );

module.exports = function restPlugin( schema ) {
    // Fields
    if (!schema.get( 'created' )) {
        schema.add( {created: Date} );
        schema.path( 'created' ).index( true );
    }
    if (!schema.get( 'modified' )) {
        schema.add( {modified: Date} );
        schema.path( 'modified' ).index( true );
    }

    // Methods
    /**
     * Get db references
     * @param {Schema} schema
     * @return {Object}
     */
    function dbrefs( schema ) {
        var refs = {};

        schema.eachPath( function( name, path ) {
            var caster = path.caster,
                opt = path.options;

            if (caster && caster.options && caster.options.ref) {
                refs[name] = name;
            } else if (opt && opt.ref) {
                refs[name] = name;
            }
        } );

        return refs;
    }

    /**
     * Handle value
     *
     * @param {Object} o
     * @param {String} key
     * @param {Mixed} val
     * @param {Boolean} isRef
     */
    function handleValue( o, key, val, isRef ) {
        if (_.isArray( val ) && isRef) {
            var copy = _.cloneDeep( val );
            _.each( copy, function( node, index ) {
                handleValue( copy, index, node, true );
            } );
            o[key] = copy;
        } else if (_.isObject( val ) && val._id && isRef) {
            o[key] = val._id;
        } else if (_.isObject( val )) {
            o[key] = _.cloneDeep( val );
        } else {
            o[key] = val;
        }
    }

    /**
     * Merge data into document
     *
     * @param {Object} data
     * @return {Object} The modified document
     */
    schema.methods.merge = function( data ) {
        var i,
            refs = dbrefs( schema );

        for (i in data) {
            if (data.hasOwnProperty( i )) {
                // Detect populated fields (ObjectId cannot cast such objects)
                handleValue( this, i, data[i], refs[i] ? true : false );
            }
        }

        // Make it fluent
        return this;
    };

    // Hooks
    // http://github.com/LearnBoost/mongoose/issues/964
    schema.pre( 'save', function( next ) {
        if (!this.created) {
            this.created = new Date();
        }
        this.modified = new Date();

        next();
    } );

};
