import _ from 'lodash'
import path from 'path'
import acl from '../rest/acl'
import Roles from '../rest/roles'

/**
 * Get role
 * @param {Object} user
 * @returns {Object}
 */
function getRole(user) {
  let guest = Roles.get('GUEST')

  if (!guest) {
    throw 'Role GUEST is not available'
  }

  if (!user || !user.role) {
    return guest
  }

  return Roles.get(user.role) || guest
}

/**
 * Filters an object literal
 * @param {Acl} acl
 * @param {Object} resource
 * @param {Object} role
 * @param {String} [privilege='R']
 * @param {Function|Array} [asserts]
 * @returns {Object}
 */
function filter(acl, resource, role, privilege, asserts) {
  privilege = privilege || 'R'
  asserts = asserts || []

  return _.pick(
    resource,
    acl.allowed(
      resource,
      role,
      privilege,
      asserts
    )
  )
}

function request(opts) {
  let routeAcl
  let file

  opts = Object.assign({
    basedir: './models'
  }, opts)

  file =
    path.join(
      path.dirname(require.main.filename),
      opts.basedir,
      opts.model.modelName.toLowerCase() +
      '.acl.json'
    )
  routeAcl = acl(require(file))

  return function(req) {
    if (req.method === 'POST' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return filter(routeAcl, node, getRole(req.user), 'C')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = filter(routeAcl, req.body, getRole(req.user), 'C')
        return
      }
    }

    // Update
    if (req.method === 'PUT' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return filter(routeAcl, node, getRole(req.user), 'U')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = filter(routeAcl, req.body, getRole(req.user), 'U')
        return
      }
    }
  }
}

function response(opts) {
  let routeAcl
  let file

  opts = Object.assign({
    basedir: './models'
  }, opts)

  file =
    path.join(
      path.dirname(require.main.filename),
      opts.basedir,
      opts.model.modelName.toLowerCase() +
      '.acl.json'
    )
  routeAcl = acl(require(file))

  return function(req, res) {
    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return filter(routeAcl, node, getRole(req.user), 'R')
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = filter(routeAcl, res.body, getRole(req.user), 'R')
      return
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
