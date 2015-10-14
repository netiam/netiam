import _ from 'lodash'
import {
  NotImplemented,
  BadRequest,
  Codes
} from 'netiam-errors'
import jsonPlugin from './json'
import jsonapiPlugin from './jsonapi'

function request() {
  return () => {
    throw new NotImplemented(Codes.E1000, '"auto.req" is not implemented')
  }
}

function response(spec = {}) {
  const jsonSpec = _.isObject(spec.json) ? spec.json : {}
  const jsonapiSpec = _.isObject(spec.jsonapi) ? spec.jsonapi : {}

  return (req, res) => {
    if (req.accepts('application/vnd.api+json')) {
      const jsonapi = jsonapiPlugin.res(jsonapiSpec)
      return jsonapi(req, res)
    }

    if (req.accepts('application/json')) {
      const json = jsonPlugin(jsonSpec)
      return json(req, res)
    }

    throw new BadRequest(Codes.E1000, 'Set a correct "Accept" header')
  }
}

export default Object.freeze({
  req: request,
  res: response
})

