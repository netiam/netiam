import _ from 'lodash'
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
  let {acl} = spec
  let o = {}

  if (!collection) {
    throw new Error('You must provide a valid "collection"')
  }

  if (!acl) {
    throw new Error('You must provide a valid "acl"')
  }

  acl = acl.loadSync()

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
    const refs = {}

    if (collection.schema && _.isObject(collection.schema.paths)) {
      _.forEach(collection.schema.paths, function(path, key) {
        if (path.options && path.options.ref) {
          refs[key] = path.options.ref
        }
      })
    }

    return refs
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
    if (acl.fields.hasOwnProperty(path)) {
      if (acl.fields[path].hasOwnProperty(type)) {
        if (acl.fields[path][type][role.name]
          && acl.fields[path][type][role.name].indexOf(privilege) !== -1
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
    if (!role) {
      return []
    }

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
    _.forEach(allRefs, function(/*ref, path*/) {
      //const path = collection.schema.path(ref)
      //const modelName = path.options.ref
      //const model = mongoose.models[modelName]
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

  /**
   * Is role with privilege allowed to access resource
   * @param {Object} role
   * @param {String} [privilege='R']
   * @returns {Boolean} True if allowed, otherwise false
   */
  function resource(role, privilege = 'R') {
    if (!acl.resource) {
      return false
    }

    if (!acl.resource[ALLOW]) {
      return false
    }

    let isAllowed = false

    role = roles.get(role)

    // wildcard allow
    if (acl.resource[ALLOW] && acl.resource[ALLOW][WILDCARD]) {
      if (acl.resource[ALLOW][WILDCARD].indexOf(privilege) !== -1) {
        isAllowed = true
      }
    }

    // allow
    if (acl.resource[ALLOW] && acl.resource[ALLOW][role.name]) {
      if (acl.resource[ALLOW][role.name].indexOf(privilege) !== -1) {
        isAllowed = true
      }
    }

    // wildcard deny
    if (acl.resource[DENY] && acl.resource[DENY][WILDCARD]) {
      if (acl.resource[DENY][WILDCARD].indexOf(privilege) !== -1) {
        isAllowed = false
      }
    }

    // deny
    if (acl.resource[DENY] && acl.resource[DENY][role.name]) {
      if (acl.resource[DENY][role.name].indexOf(privilege) !== -1) {
        isAllowed = false
      }
    }

    return isAllowed
  }

  o.allowed = allowed
  o.filter = filter
  o.resource = resource

  return Object.freeze(o)
}
