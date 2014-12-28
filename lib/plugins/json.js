'use strict';

function json( resource, opts, req, res ) {
    if (resource.body()) {
        return res.json( resource.body() );
    }

    return res
        .status( 204 )
        .send();
}

module.exports = json;
