import _ from 'lodash'

/**
 * Filters an object literal
 *
 * @param {Object} user
 * @param {Object} acl
 * @param {Object} resource
 * @param {Object} role
 * @param {String} [privilege='R']
 * @param {Function|Array} [asserts]
 * @returns {Object}
 */
export default function filter(user, acl, resource, role, privilege = 'R', asserts = []) {
  return _.pick(
    resource,
    acl.allowed(
      user,
      resource,
      role,
      privilege,
      asserts
    )
  )
}
