import _ from 'lodash'

/**
 * Filters an object literal
 *
 * @param {Object} acl
 * @param {Object} resource
 * @param {Object} role
 * @param {String} [privilege='R']
 * @param {Function|Array} [asserts]
 * @returns {Object}
 */
export default function filter(acl, resource, role, privilege = 'R', asserts = []) {
  if (_.isFunction(asserts)) {
    asserts = [asserts]
  }

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
