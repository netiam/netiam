'use strict';

var _ = require( 'lodash' );

function json( resource, data, req, res ) {
    resource.body( data );
}

module.exports = json;
