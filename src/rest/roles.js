import _ from 'lodash'
import Role from './models/role'

const ids = {}
const names = {}
let roles = []
let isLoaded = false

function load(cb) {
  Role.find({}, function(err, documents) {
    if (err) {
      return cb(err)
    }

    roles = roles.concat(documents)
    roles.forEach(function(role) {
      ids[role.id] = role
      names[role.name] = role
    })

    isLoaded = true

    cb()
  })
}

function getByName(role) {
  if (!isLoaded) {
    throw new Error('Roles not loaded')
  }

  return names[role.toUpperCase()]
}

function getById(role) {
  if (!isLoaded) {
    throw new Error('Roles not loaded')
  }

  return ids[role]
}

/**
 * Normalize role input as string
 * @param {String} role
 * @returns {Object} The normalized role
 */
function normalizeString(role) {
  // Evaluate as ID
  if (getById(role)) {
    return getById(role)
  }
  // Evaluate as name
  if (getByName(role)) {
    return getByName(role)
  }

  // Return guest
  return getByName('guest')
}

/**
 * Normalize role input as object
 * @param {String} role
 * @returns {Role} The normalized role
 */
function normalizeObject(role) {
  // Evaluate as native MongoDB ObjectID
  if (role.toString && getById(role.toString())) {
    return getById(role.toString())
  }

  // Evaluate as object with id.toString()
  if (role.id && getById(role.id)) {
    return getById(role.id)
  }

  // Evaluate as object with id
  if (role.id && getById(role.id)) {
    return getById(role.id)
  }

  // Evaluate as object with name
  if (role.name && getByName(role.name)) {
    return getByName(role.name)
  }

  // Return guest
  return getByName('guest')
}

/**
 * Normalize input values and returns the specified role
 * @param {String|Object} role
 * @returns {Role} The normalized role
 */
function normalize(role) {
  if (!role) {
    throw 'Invalid role: ' + role
  }

  if (!roles) {
    throw 'Roles middleware is not ready'
  }

  if (_.isString(role)) {
    return normalizeString(role)
  }

  if (_.isObject(role)) {
    return normalizeObject(role)
  }

  // Return guest
  return getByName('guest')
}

/**
 * Get role by ID, name or the role object itself.
 * Use this method to normalize access to roles.
 * @param {String|Object} role
 * @returns {Role}
 */
function get(role) {
  role = normalize(role)

  if (!role) {
    throw new Error('Role does not exist')
  }

  return role
}

/**
 * Add role
 * @param {String} name
 * @param {String} [parent]
 * @returns {Role}
 */
function add(name, parent) {
  let role = new Role({
    name: name,
    parent: parent ? get(parent) : null
  })

  names[role] = role

  return role
}

/**
 * Is role already registered
 * @param {String|Object} role
 * @returns {Boolean}
 */
function has(role) {
  return get(role) ? true : false
}

export default Object.freeze({
  add,
  has,
  get,
  load
})
