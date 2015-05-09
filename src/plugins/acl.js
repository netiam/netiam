import _ from 'lodash'
import acl from '../rest/acl'
import roles from '../rest/roles'

/**
 * Get role
 * @param {Object} user
 * @returns {Object}
 */
function getRole(user) {
  const guest = roles.get('GUEST')
  const userRole = roles.get(user.role)

  if (userRole) {
    return userRole
  }

  if (!guest) {
    throw 'Role GUEST is not available'
  }

  return guest
}

function request(opts) {
  const list = acl(opts)

  return function(req) {
    if (req.method === 'POST' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, getRole(req.user), 'C')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, getRole(req.user), 'C')
        return
      }
    }

    // update
    if (req.method === 'PUT' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, getRole(req.user), 'U')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, getRole(req.user), 'U')
      }
    }
  }
}

function response(opts) {
  const list = acl(opts)

  return function(req, res) {
    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return list.filter(node, getRole(req.user), 'R')
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = list.filter(res.body, getRole(req.user), 'R')
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
