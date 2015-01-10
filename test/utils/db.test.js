'use strict';

var mongoose = require( 'mongoose' );

module.exports = mongoose.connect( 'mongodb://localhost:27017/netiam-list-test' );
