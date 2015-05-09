import _ from 'lodash'
import mongoose from 'mongoose'
import roles from './roles'

/**
 * ACL
 * @param {Object} spec
 */
export default function acl(spec) {
  const WILDCARD = '*'
  const ALLOW = 'ALLOW'
  const DENY = 'DENY'
  const {collection} = spec
  let {list} = spec
  let o = {}

  list = list.loadSync()

  /**
   * Get all keys from collection
   * @returns {[String]}
   */
  function keys() {
    return Object.keys(collection.schema.paths)
  }

  /**
   * Get all keys which a possible population
   * @returns {[String]}
   */
  function refs() {
    return collection.refs()
  }

  /**
   * Check path for allowed keys, can also handle wildcard entries
   * @param {[String]} allKeys
   * @param {String} path
   * @param {String} type
   * @param {Role} role
   * @param {String} privilege
   * @returns {[String]}
   */
  function path(allKeys, path, type, role, privilege) {
    if (list.fields.hasOwnProperty(path)) {
      if (list.fields[path].hasOwnProperty(type)) {
        if (list.fields[path][type][role.name]
          && list.fields[path][type][role.name].indexOf(privilege) !== -1
        ) {
          if (path === WILDCARD) {
            return allKeys
          }
          return [path]
        }
      }
    }
    return []
  }

  /**
   * Get hierarchy for current role
   * @param {Object} role
   * @returns {[Object]}
   */
  function hierarchy(role) {
    if (!role.parent) {
      return [roles.get(role)]
    }

    return [roles.get(role)].concat(hierarchy(role.parent))
  }

  /**
   * Get allowed keys for a specific role
   * @param {Object} resource
   * @param {String|Object} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {[String]} A list of allowed keys for given collection
   */
  function allowedForRole(resource, role, privilege, asserts) {
    role = roles.get(role)
    const allKeys = keys()
    const allRefs = refs()
    let allowedKeys = []
    let deniedKeys = []

    // return all keys for superuser
    if (role.superuser === true) {
      return allKeys
    }

    // ALLOW statements
    allKeys.forEach(function(key) {
      allowedKeys = allowedKeys.concat(
        path(allKeys, key, ALLOW, role, privilege)
      )
    })

    // asserts
    asserts.forEach(function(assert) {
      allowedKeys = allowedKeys.concat(
        assert(o, resource, role, privilege)
      )
    })

    // DENY statements
    allKeys.forEach(function(key) {
      deniedKeys = deniedKeys.concat(
        path(allKeys, key, DENY, role, privilege)
      )
    })

    // expand populated paths
    allRefs.forEach(function(ref) {
      const path = collection.schema.path(ref)
      const modelName = path.options.ref
      const model = mongoose.models[modelName]
    })

    return _.uniq(
      _.difference(allowedKeys, deniedKeys)
    )
  }

  /**
   * Get allowed keys for given collection
   * @param {String} resource
   * @param {String|Object} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {[String]} A list of allowed keys for given collection
   */
  function allowed(resource, role, privilege = 'R', asserts = []) {
    role = roles.get(role)
    const roleHierarchy = hierarchy(role).reverse()
    let allowedKeys = []

    if (_.isFunction(asserts)) {
      asserts = [asserts]
    }

    roleHierarchy.forEach(function(r) {
      allowedKeys = allowedKeys.concat(allowedForRole(resource, r, privilege, asserts))
    })

    return allowedKeys
  }

  /**
   * Filters a resource object by ACL
   * @param {Object} resource
   * @param {Object} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {Object}
   */
  function filter(resource, role, privilege = 'R', asserts = []) {
    return _.pick(
      resource,
      allowed(
        resource,
        role,
        privilege,
        asserts
      )
    )
  }

  o.allowed = allowed
  o.filter = filter

  return Object.freeze(o)
}
