import _ from 'lodash'
import roles from './roles'

/**
 * Acl owner assertion
 * @param {String} field
 * @returns {Function} assertion function
 */
function owner(field) {

  /**
   * @param {User} user
   * @param {Object} acl
   * @param {Object} resource
   * @param {Object} role
   * @param {String} privilege
   * @returns {Array} List of allowed keys
   */
  return function(user, acl, resource, role, privilege = 'R') {
    // add role OWNER to allow checks against ACLs with owner assert
    if (!roles.has('OWNER')) {
      roles.add('OWNER')
    }

    if (!user || !user.id) {
      return []
    }

    let value = resource[field]

    if (_.isFunction(value.toString)) {
      value = value.toString()
    }

    if (!value) {
      return []
    }

    if (value !== user.id) {
      return []
    }

    return acl.allowed(
      user,
      resource,
      roles.get('OWNER'),
      privilege
    )
  }
}

export default Object.freeze({
  owner
})
