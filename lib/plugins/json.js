'use strict';

var _ = require( 'lodash' );

function json( resource, opts, req, res ) {
    if (resource.data) {
        return res.json( resource.data );
    }

    return res
        .status( 204 )
        .send();
}

module.exports = json;
