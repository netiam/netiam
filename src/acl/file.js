import fs from 'fs'
import path from 'path'

/**
 * File-based ACLs
 * @param {Object} config
 * @param {String} config.path
 * @returns {{get:get, isLoaded:isLoaded, load: load}}
 */
export default function(config) {
  const file = path.resolve(config.path)
  let list
  let loaded = false

  /**
   * Load ACL file
   * @param {Function} cb
   */
  function load(cb) {
    fs.readFile(file, function(err, data) {
      if (err) {
        return cb(err)
      }

      try {
        list = JSON.parse(data)
        loaded = true
        cb(err, list)
      } catch (e) {
        cb(e)
      }
    })
  }

  /**
   * Get list
   * @returns {Object}
   */
  function get() {
    return list
  }

  /**
   * Is loaded
   * @returns {boolean}
   */
  function isLoaded() {
    return loaded
  }

  return Object.freeze({
    get,
    isLoaded,
    load
  })
}
