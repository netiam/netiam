'use strict';

// Dependencies
var mongoose   = require( 'mongoose' ),
    Schema     = mongoose.Schema,
    restPlugin = require( '../../lib/rest/model' );

// Define user schema
var schema = new Schema( {
    name:        String,
    description: String,
    email:       {
        type:   String,
        unique: true,
        sparse: true
    },
    password:    String,
    firstname:   String,
    lastname:    String,
    location:    {
        type:  [Number],
        index: '2dsphere'
    }
} );

// Apply plugin(s)
schema.plugin( restPlugin, {} );

// Create model class and export
module.exports = mongoose.model( 'User', schema );
