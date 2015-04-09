/**
 * Cache
 * @param {Object} config
 * @param {String} config.path
 * @returns {{has: has, load: load, save: save}}
 */
export default function(config) {
  let client = config.client
  let PREFIX = config.PREFIX || 'cache:'

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
    client.get(get(id), cb)
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
