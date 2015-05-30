/**
 * REST Error
 * @param {String} message
 * @param {Number} [code=500]
 * @param {String} [status]
 * @param {*} [data]
 * @constructor
 */
function RESTError(message, code, status, data) {

  if (message instanceof Error) {
    this.message = message.message
  } else {
    this.message = message
  }

  this.code = code || 500
  this.status = status
  this.data = data
}

RESTError.prototype = new Error()

export default RESTError

// 4xx
export function badRequest(message = undefined, data = undefined) {
  return new RESTError(message, 400, 'Bad Request', data)
}

export function unauthorized(message = undefined, data = undefined) {
  return new RESTError(message, 401, 'Unauthorized', data)
}

export function forbidden(message = undefined, data = undefined) {
  return new RESTError(message, 403, 'Forbidden', data)
}

export function notFound(message = undefined, data = undefined) {
  return new RESTError(message, 404, 'Not Found', data)
}

export function methodNotAllowed(message = undefined, data = undefined) {
  return new RESTError(message, 405, 'Method Not Allowed', data)
}

// 5xx
export function internalServerError(message = undefined, data = undefined) {
  return new RESTError(message, 500, 'Internal Server Error', data)
}

export function notImplemnted(message = undefined, data = undefined) {
  return new RESTError(message, 501, 'Not Implemented', data)
}
