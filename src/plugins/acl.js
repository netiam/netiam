import _ from 'lodash'
import acl from '../rest/acl'
import roles from '../rest/roles'

function request(opts) {
  const list = acl(opts)

  return function(req) {
    if (req.method === 'POST' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, roles.get(req.user), 'C')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, roles.get(req.user), 'C')
        return
      }
    }

    // update
    if (req.method === 'PUT' && req.is('json')) {
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return list.filter(node, roles.get(req.user), 'U')
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = list.filter(req.body, roles.get(req.user), 'U')
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
          return list.filter(node, roles.get(req.user), 'R')
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = list.filter(res.body, roles.get(req.user), 'R')
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
