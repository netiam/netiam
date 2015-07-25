/**
 * Cache
 * @param {Object} config
 * @param {String} config.path
 * @returns {{has: has, load: load, save: save}}
 */
export default function(config) {
  const {client} = config
  let {PREFIX} = config

  PREFIX = PREFIX || 'cache:'

  /**
   * Get KEY
   * @param {String} id
   * @returns {String}
   */
  function get(id) {
    return PREFIX + id
  }

  /**
   * Has cache entry
   * @param {String} id
   * @param {Function} cb
   */
  function has(id, cb) {
    client.get(get(id), function(err, val) {
      if (err) {
        return cb(err)
      }

      cb(null, val ? true : false)
    })
  }

  /**
   * Load cache entry
   * @param {String} id
   * @param {Function} cb
   */
  function load(id, cb) {
    client.get(get(id), function(err, data) {
      if (!data) {
        return cb(new Error(`Cache entry does not exist: "${id}"`))
      }

      cb(err, data)
    })
  }

  /**
   * Save cache entry
   * @param {String} id
   * @param {String} data
   * @param {Function} cb
   */
  function save(id, data, cb) {
    client.set(get(id), data, cb)
  }

  return Object.freeze({
    has,
    load,
    save
  })
}
