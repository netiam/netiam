import * as errors from 'netiam-errors'
import resourceRest from '../rest/resource'
import {ONE_TO_MANY, MANY_TO_ONE} from '../rest/relationships'

export default function rest(spec) {
  const resource = resourceRest(spec)
  const {relationship} = spec

  return async function(req, res) {
    const method = req.method
    let isList = false
    let idParam = spec.idParam || 'id'

    if (!req.params[idParam]) {
      isList = true
    }

    if (relationship && relationship.type === ONE_TO_MANY) {
      if (req.idParam === relationship.idParam) {
        throw errors.internalServerError(
          'The relationship "idParam" must not match the base "idParam"')
      }
      if (!req.params[relationship.idParam]) {
        isList = true
      }
    }

    if (method === 'GET' && isList) {
      res.body = await resource.list(req, res)
      return res.status(200)
    }

    if (method === 'POST') {
      res.body = await resource.create(req, res)
      return res.status(201)
    }

    if (method === 'GET') {
      res.body = await resource.read(req, res)
      return res.status(200)
    }

    if (method === 'PATCH') {
      res.body = await resource.update(req, res)
      return res.status(200)
    }

    if (method === 'PUT') {
      res.body = await resource.update(req, res)
      return res.status(200)
    }

    if (method === 'DELETE') {
      res.body = await resource.remove(req, res)
      return res.status(204)
    }
  }
}
