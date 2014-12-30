'use strict';

/**
 * REST Error
 * @param {String} message
 * @param {Number} [code=500]
 * @param {String} [status]
 * @param {mixed} [data]
 * @constructor
 */
function RESTError( message, code, status, data ) {

    if (message instanceof Error) {
        this.message = message.message;
    } else {
        this.message = message;
    }

    this.code = code || 500;
    this.status = status;
    this.data = data;
}

RESTError.prototype = new Error();

module.exports = RESTError;
