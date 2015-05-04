import _ from 'lodash'
import path from 'path'
import acl from '../rest/acl'
import roles from '../rest/roles'

/**
 * Get role
 * @param {Object} user
 * @returns {Object}
 */
function getRole(user) {
  const guest = roles.get('GUEST')

  if (!guest) {
    throw 'Role GUEST is not available'
  }

  if (!user || !user.role) {
    return guest
  }

  return roles.get(user.role) || guest
}

function request(opts) {
  opts = Object.assign({
    basedir: './models'
  }, opts)

  const file =
    path.join(
      path.dirname(require.main.filename),
      opts.basedir,
      opts.model.modelName.toLowerCase() +
      '.acl.json'
    )
  const routeAcl = acl(require(file))

  return function(req) {
    if (req.method === 'POST' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return routeAcl.filter(node, getRole(req.user), 'C')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = routeAcl.filter(req.body, getRole(req.user), 'C')
        return
      }
    }

    // Update
    if (req.method === 'PUT' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return routeAcl.filter(node, getRole(req.user), 'U')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = routeAcl.filter(req.body, getRole(req.user), 'U')
        return
      }
    }
  }
}

function response(opts) {
  opts = Object.assign({
    basedir: './models'
  }, opts)

  const file =
    path.join(
      path.dirname(require.main.filename),
      opts.basedir,
      opts.model.modelName.toLowerCase() +
      '.acl.json'
    )
  const routeAcl = acl(require(file))

  return function(req, res) {
    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return routeAcl.filter(node, getRole(req.user), 'R')
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = routeAcl.filter(res.body, getRole(req.user), 'R')
      return
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
