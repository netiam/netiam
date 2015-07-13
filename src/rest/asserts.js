import _ from 'lodash'

/**
 * Acl owner assertion
 * @param {String} field
 * @returns {Function} assertion function
 */
function owner(field) {

  /**
   * @param {User} user
   * @param {Object} resource
   * @param {Object} role
   * @param {String} privilege
   * @returns {Array} List of allowed keys
   */
  return function(user, resource) {
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

    if (value !== user.id) {
      return false
    }

    return true
  }
}

export default Object.freeze({
  owner
})
