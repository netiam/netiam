'use strict';

let netiam = require('./lib/netiam')

netiam.cache = {
  file: require('./lib/cache/file'),
  redis: require('./lib/cache/redis')
}

module.exports = netiam
