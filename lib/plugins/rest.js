'use strict';

var reso = require( '../rest/resource' );

function rest( resource, opts, req, res ) {
    var r = reso( opts.model, opts.resource );
    r.read( req, res, function() {

    } );
}

module.exports = json;
