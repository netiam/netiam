import _ from 'lodash'
import roles from '../rest/roles'
import * as error from '../rest/error'

function request(opts) {
  const {collection} = opts
  let {asserts} = opts
  //const Model = collection

  asserts = asserts || []

  return function(req) {
    const role = roles.get(req.user ? req.user.role : null)

    // create
    if (req.method === 'POST' && req.is('json')) {
      if (!collection.checkResourceAcl(req.user, role, 'C')) {
        throw error.forbidden(
          `You have not enough privileges to create this resource as ${role.name}`
        )
      }

      /*
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return collection.filterByAcl(
            req.user, new Model(node), role, 'C', asserts)
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = collection.filterByAcl(
          req.user, new Model(req.body), role, 'C', asserts)
        return
      }
      */
    }

    // update
    if (req.method === 'PUT' && req.is('json')) {
      if (!collection.checkResourceAcl(req.user, role, 'U')) {
        throw error.forbidden(
          `You have not enough privileges to modify this resource as ${role.name}`
        )
      }
      /*
      if (_.isArray(req.body)) {
        req.body = _.map(function(node) {
          return collection.filterByAcl(
            req.user, new Model(node), role, 'U', asserts)
        })
        return
      }

      if (_.isObject(req.body)) {
        req.body = collection.filterByAcl(
          req.user, new Model(req.body), role, 'U', asserts)
      }
      */
    }
  }
}

function response(opts) {
  const {collection} = opts
  let {asserts} = opts

  asserts = asserts || []

  return function(req, res) {
    const role = roles.get(req.user ? req.user.role : null)

    if (!collection.checkResourceAcl(req.user, role, 'R')) {
      throw error.forbidden(
        `You have not enough privileges to read this resource as ${role.name}`
      )
    }

    if (_.isArray(res.body)) {
      res.body =
        _.map(res.body, function(node) {
          return collection.filterByAcl(req.user, node, role, 'R', asserts)
        })
      return
    }

    if (_.isObject(res.body)) {
      res.body = collection.filterByAcl(req.user, res.body, role, 'R', asserts)
    }
  }
}

export default Object.freeze({
  req: request,
  res: response
})
