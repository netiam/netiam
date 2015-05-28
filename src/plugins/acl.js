import _ from 'lodash'
import acl from '../rest/acl'
import roles from '../rest/roles'
import RESTError from '../rest/error'

function request(opts) {
  const list = acl(opts)

  return function(req) {
    const role = roles.get(req.user ? req.user.role : null)

    // create
    if (req.method === 'POST' && req.is('json')) {
      if (!list.resource(role, 'C')) {
        throw new RESTError(
          `You have not enough privileges to create this resource as ${role.name}`,
          403,
          'Forbidden'
        )
      }

      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, role, 'C')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, role, 'C')
        return
      }
    }

    // update
    if (req.method === 'PUT' && req.is('json')) {
      if (!list.resource(role, 'U')) {
        throw new RESTError(
          `You have not enough privileges to modify this resource as ${role.name}`,
          403,
          'Forbidden'
        )
      }

      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, role, 'U')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, role, 'U')
      }
    }
  }
}

function response(opts) {
  const list = acl(opts)

  return function(req, res) {
    const role = roles.get(req.user ? req.user.role : null)

    if (!list.resource(role, 'R')) {
      throw new RESTError(
        `You have not enough privileges to read this resource as ${role.name}`,
        403,
        'Forbidden'
      )
    }

    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return list.filter(node, role, 'R')
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = list.filter(res.body, role, 'R')
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
