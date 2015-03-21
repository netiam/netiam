'use strict';

var netiam = require( './lib/netiam' );

netiam.cache = {
    file: require( './lib/cache/file' )
};

module.exports = netiam;
