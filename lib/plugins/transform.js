'use strict';

function custom( resource, cb, req, res ) {
    cb( resource, req, res );
}

module.exports = custom;
