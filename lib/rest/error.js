'use strict';

function RESTError( message, code ) {

    if (message instanceof Error) {
        this.message = message.message;
    } else {
        this.message = message;
    }

    this.code = code;
}

RESTError.prototype = new Error();

module.exports = RESTError;