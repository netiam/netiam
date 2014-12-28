'use strict';
// jshint unused:true

/**
 * JSON
 * @param {Resource} resource
 * @param {Object} content
 */
function data( resource, content ) {
    resource.body( content );
}

module.exports = data;
