'use strict';

var mongoose = require( 'mongoose' ),
    Schema   = mongoose.Schema,
    schema;

schema = new Schema( {
    name:        {
        type:     String,
        unique:   true,
        required: true
    },
    parent:      {
        type: Schema.Types.ObjectId,
        ref:  'Role'
    },
    superuser:   Boolean,
    description: String
} );

module.exports = mongoose.model( 'Role', schema );
