import _ from 'lodash'
import roles from '../roles'

/**
 * Acl owner assertion
 * @param {String} field
 * @returns {Function} assertion function
 */
export default function owner(field) {

  /**
   * @param {User} user
   * @param {Object} resource
   * @returns {Boolean} True if user is owner of resource, otherwise false
   */
  function isOwner(user, resource) {
    if (!user || !user.id) {
      return false
    }

    let value = resource[field]

    if (!value) {
      return false
    }

    if (_.isFunction(value.toString)) {
      value = value.toString()
    }

    return value === user.id
  }

  return function(user, acl, resource, role, privilege = 'R') {
    if (!isOwner(user, resource)) {
      return []
    }

    return acl.allowed(user, resource, roles.get('OWNER'), privilege)
  }
}
