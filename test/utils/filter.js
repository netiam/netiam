import _ from 'lodash'

/**
 * Filters an object literal
 *
 * @param {Acl} acl
 * @param {Object} resource
 * @param {Object} role
 * @param {String} [privilege='R']
 * @param {Function|Array} [asserts]
 * @returns {Object}
 */
function filter(acl, resource, role, privilege, asserts) {
  privilege = privilege || 'R'
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

export default {
  filter
}
