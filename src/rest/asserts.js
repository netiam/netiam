import roles from './roles'

/**
 * Acl owner assertion
 * @param {String} field
 * @param {String} value
 * @returns {Function} assertion function
 */
function owner(field, value) {

  /**
   * @param {Object} acl
   * @param {Object} resource
   * @param {Object} role
   * @param {String} privilege
   * @returns {Array} List of allowed keys
   */
  return function(acl, resource, role, privilege = 'R') {
    let user
    if (resource.hasOwnProperty(field)) {
      user = resource[field]
    }

    // return early if user does not own resource
    if (user !== value) {
      return []
    }

    return acl.allowed(
      resource,
      roles.get('OWNER'),
      privilege
    )
  }
}

// add role OWNER to allow checks against ACLs with owner assert
if (!roles.has('OWNER')) {
  roles.add('OWNER')
}

export default Object.freeze({
  owner
})
