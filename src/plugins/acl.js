import _ from 'lodash'
import aclFilter from '../rest/acl'
import roles from '../rest/roles'
import * as error from '../rest/error'

function request(spec) {
  const {asserts} = spec
  const acl = aclFilter({settings: spec.settings})

  return function(req) {
    const role = roles.get(req.user ? req.user.role : null)

    // create
    if (req.method === 'POST' && req.is('json')) {
      if (!acl.resource(req.user, role, 'C')) {
        throw error.forbidden(
          `You have not enough privileges to create this resource as ${role.name}`
        )
      }

      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return acl.filter(req.user, node, role, 'C', asserts)
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = acl.filter(req.user, req.body, role, 'C', asserts)
        return
      }
    }

    // update
    if (req.method === 'PUT' && req.is('json')) {
      if (!acl.resource(req.user, role, 'U')) {
        throw error.forbidden(
          `You have not enough privileges to modify this resource as ${role.name}`
        )
      }

      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return acl.filter(req.user, node, role, 'U', asserts)
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = acl.filter(req.user, req.body, role, 'U', asserts)
      }
    }
  }
}

function response(spec) {
  const {asserts} = spec
  const acl = aclFilter({settings: spec.settings})

  return function(req, res) {
    const role = roles.get(req.user ? req.user.role : null)

    if (!acl.resource(req.user, role, 'R')) {
      throw error.forbidden(
        `You have not enough privileges to read this resource as ${role.name}`
      )
    }

    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return acl.filter(req.user, node, role, 'R', asserts)
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = acl.filter(req.user, res.body, role, 'R', asserts)
    }
  }
}

export default Object.freeze({
  req: request,
  res: response
})
