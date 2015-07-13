import _ from 'lodash'
import roles from './roles'

export default function(spec) {
  const WILDCARD = '*'
  const ALLOW = 'ALLOW'
  const DENY = 'DENY'
  const {settings} = spec
  let o = {}

  if (!settings) {
    throw new Error('You must provide an ACL "settings" option')
  }

  /**
   * Get all keys from collection
   * @returns {[String]}
   */
  function keys(schema) {
    return Object.keys(schema.paths)
  }

  /**
   * Get all keys which a possible population
   * @returns {[String]}
   */
  function refs(schema) {
    const paths = {}

    if (schema && _.isObject(schema.paths)) {
      _.forEach(schema.paths, function(path, key) {
        if (path.options && path.options.ref) {
          paths[key] = path.options.ref
        }
      })
    }

    return paths
  }

  /**
   * Get schema for resource
   * @param {Document} resource
   * @returns {Schema}
   */
  function getSchemaForResource(resource) {
    return resource.constructor.schema
  }

  /**
   * Check path for allowed keys, can also handle wildcard entries
   * @param {[String]} allKeys
   * @param {String} modelPath
   * @param {String} type
   * @param {Role} role
   * @param {String} privilege
   * @returns {[String]}
   */
  function path(allKeys, modelPath, type, role, privilege) {
    if (settings.fields.hasOwnProperty(modelPath)) {
      if (settings.fields[modelPath].hasOwnProperty(type)) {
        if (settings.fields[modelPath][type][role.name] &&
          settings.fields[modelPath][type][role.name].indexOf(privilege) !== -1
        ) {
          if (modelPath === WILDCARD) {
            return allKeys
          }
          return [modelPath]
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
   * @param {User} user
   * @param {Object} resource
   * @param {String|Object} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {[String]} A list of allowed keys for given collection
   */
  function allowedForRole(user, resource, role, privilege, asserts) {
    role = roles.get(role)
    const schema = getSchemaForResource(resource)
    const allKeys = keys(schema)
    let allowedKeys = []
    let deniedKeys = []

    // return all keys for superuser
    if (role.superuser === true) {
      return allKeys
    }

    // ALLOW wildcard
    allowedKeys = allowedKeys.concat(
      path(allKeys, WILDCARD, ALLOW, role, privilege)
    )

    // ALLOW statements
    allKeys.forEach(function(key) {
      allowedKeys = allowedKeys.concat(
        path(allKeys, key, ALLOW, role, privilege)
      )
    })

    // asserts
    asserts.forEach(function(assert) {
      allowedKeys = allowedKeys.concat(
        assert(user, o, resource, role, privilege)
      )
    })

    // ALLOW wildcard
    deniedKeys = deniedKeys.concat(
      path(allKeys, WILDCARD, DENY, role, privilege)
    )

    // DENY statements
    allKeys.forEach(function(key) {
      deniedKeys = deniedKeys.concat(
        path(allKeys, key, DENY, role, privilege)
      )
    })

    return _.uniq(
      _.difference(allowedKeys, deniedKeys)
    )
  }

  /**
   * Get allowed keys for given collection
   * @param {User} user
   * @param {String} resource
   * @param {String|Object} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {[String]} A list of allowed keys for given collection
   */
  function allowed(user, resource, role, privilege = 'R', asserts = []) {
    role = roles.get(role)
    const roleHierarchy = hierarchy(role).reverse()
    let allowedKeys = []

    if (!_.isArray(asserts)) {
      asserts = [asserts]
    }

    asserts.forEach(function(assert) {
      allowedKeys = allowedKeys.concat(
        assert(user, o, resource, role, privilege))
    })

    roleHierarchy.forEach(function(r) {
      allowedKeys = allowedKeys.concat(
        allowedForRole(user, resource, r, privilege, asserts))
    })

    return allowedKeys
  }

  /**
   * Filters a resource object by ACL
   * @param {Document} user
   * @param {Document} resource
   * @param {Document} role
   * @param {String} [privilege='R']
   * @param {Array} [asserts=[]]
   * @returns {Object}
   */
  function filter(user, resource, role, privilege = 'R', asserts = []) {
    const schema = getSchemaForResource(resource)
    const data = _.pick(
      resource,
      allowed(
        user,
        resource,
        role,
        privilege,
        asserts
      )
    )

    // filter in populated paths
    const allRefs = refs(schema)
    _.forEach(allRefs, function(ref, path) {
      // list of documents
      if (_.isArray(data[path]) && data[path].length > 0) {
        data[path] = data[path].map(function(nestedResource) {
          if (nestedResource.getAcl) {
            return o.filterByAcl(user, role, privilege, asserts)
          }

          return o
        })
        return
      }

      // single document
      if (_.isObject(data[path])) {
        if (data[path].filterByAcl) {
          data[path] = data[path].filterByAcl(user, role, privilege, asserts)
          return
        }
        return data[path]
      }
    })

    return data
  }

  /**
   * Is role with privilege allowed to access resource
   * @param {User} user
   * @param {Object} role
   * @param {String} [privilege='R']
   * @returns {Boolean} True if allowed, otherwise false
   */
  function resource(user, role, privilege = 'R') {
    if (!settings.resource) {
      return false
    }

    if (!settings.resource[ALLOW]) {
      return false
    }

    let isAllowed = false

    role = roles.get(role)

    // wildcard allow
    if (settings.resource[ALLOW] && settings.resource[ALLOW][WILDCARD]) {
      if (settings.resource[ALLOW][WILDCARD].indexOf(privilege) !== -1) {
        isAllowed = true
      }
    }

    // allow
    if (settings.resource[ALLOW] && settings.resource[ALLOW][role.name]) {
      if (settings.resource[ALLOW][role.name].indexOf(privilege) !== -1) {
        isAllowed = true
      }
    }

    // wildcard deny
    if (settings.resource[DENY] && settings.resource[DENY][WILDCARD]) {
      if (settings.resource[DENY][WILDCARD].indexOf(privilege) !== -1) {
        isAllowed = false
      }
    }

    // deny
    if (settings.resource[DENY] && settings.resource[DENY][role.name]) {
      if (settings.resource[DENY][role.name].indexOf(privilege) !== -1) {
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
