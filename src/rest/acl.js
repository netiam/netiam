import _ from 'lodash'
import roles from './roles'

/**
 * acl
 * @param {Object} opts
 */
export default function acl(opts) {
  const wc = opts['*']

  /**
   * Get allowed key for a specific role. This method does not traverse up
   * the inheritance chain of roles. It just matches against the current role.
   * TODO Add wildcard support
   * TODO Add support to recognize DENY, ALLOW order. DENY will overrule ALLOW
   * by default. TODO Populated properties: If a populated property is allowed,
   * check nested props too TODO Add support for nested structures (dot
   * notation
   * "a.b.c" : "R") TODO Should be cached?
   * @param {Object} allowedKeys Current list of allowey keys
   * @param {Role} role The role you want to check for
   * @param {String} [privilege] Privilege that need to be checked, default is
   *     "R" -> READ
   * @returns {Array} A list of allowed keys
   */
  function roleAllowed(allowedKeys, role, privilege) {
    privilege = privilege || 'R'

    // Wildcards
    if (wc && wc.ALLOW && wc.ALLOW[role]) {
      if (wc.ALLOW[role].indexOf(privilege) !== -1) {
        allowedKeys = allowedKeys.concat(_.keys(opts))
      }
    }

    // Granular privileges
    _.forEach(opts, function(prop, key) {
      // Not allowed by default
      let privileges

      // ALLOW
      if (prop.ALLOW && prop.ALLOW[role]) {
        privileges = prop.ALLOW[role]
        if (privileges.indexOf(privilege) !== -1) {
          allowedKeys.push(key)
        }
      }

      // DENY
      if (prop.DENY && prop.DENY[role]) {
        privileges = prop.DENY[role]
        if (privileges.indexOf(privilege) !== -1) {
          _.remove(allowedKeys, function(node) {
            return node === key
          })
        }
      }
    })

    // Remove wildcard key
    delete allowedKeys['*']

    // Unique
    return _.uniq(allowedKeys)
  }

  /**
   * Get full hierarchy of role
   *
   * @param {Role} role
   * @returns {Array}
   * @private
   */
  function getRoleHierarchy(role) {
    if (!role.parent) {
      return [roles.get(role)]
    }

    return [roles.get(role)].concat(getRoleHierarchy(role.parent))
  }

  /**
   * Returns a list of allowed keys for this resource, role and privilege.
   * Be aware of the fact that if a property is not defined within the JSON ACL,
   * it will not be recognized by the system.
   * This method will traverse up the inheritance chain of a role to find all
   * properties allowed.
   * @param {Object} resource
   * @params {Role} role object
   * @params {String} [privilege="R"] privilege that need to be checked
   * @params {Array|Function} [asserts=[]] optional asserts
   * @returns {Array} list of allowed keys
   */
  function allowed(resource, role, privilege, asserts) {
    let that
    let allowedKeys

    privilege = privilege || 'R'

    that = this
    allowedKeys = []
    role = roles.get(role)

    // Ger role hierarchy
    let userRoles = getRoleHierarchy(role).reverse()

    // Assertions
    if (_.isFunction(asserts)) {
      asserts = [asserts]
    }

    if (_.isArray(asserts)) {
      _.forEach(asserts, function(assert) {
        allowedKeys = allowedKeys.concat(assert(that, resource, role, privilege))
      })
    }

    // Get keys for roles
    _.forEach(userRoles, function(userRole) {
      allowedKeys = allowedKeys.concat(that.roleAllowed(allowedKeys, userRole.name, privilege))
    })

    // Unique
    return _.uniq(allowedKeys)
  }

  /**
   * Returns a list of keys for a specific role and privilege
   * @param {Role} role
   * @param {String} [privilege='R']
   */
  function keys(role, privilege) {
    privilege = privilege || 'R'
    return roleAllowed([], role.name, privilege)
  }

  return Object.freeze({
    roleAllowed,
    allowed,
    keys
  })

}
