import dbg from 'debug'
import mkdirp from 'mkdirp'
import path from 'path'
import Promise from 'bluebird'

const fs = Promise.promisifyAll(require('fs'))

/**
 * Cache
 * @param {Object} config
 * @param {String} config.path
 * @returns {{has: has, load: load, save: save}}
 */
export default function(config) {
  if (!path.resolve) {
    throw new Error('You must provide a cache directory as "path" option')
  }

  const base = path.resolve(config.path)

  // Create cache dir
  mkdirp(base, function(err) {
    if (err) {
      console.error(err)
    }
  })

  /**
   * Get cache path
   * @param {String} id
   * @returns {String}
   */
  function get(id) {
    return path.resolve(base, id)
  }

  /**
   * Has cache entry
   * @param {String} id
   */
  function has(id) {
    return new Promise(resolve => {
      fs.accessAsync(get(id), fs.R_OK | fs.W_OK, err => {
        resolve(err ? false : true)
      })
    })
  }

  /**
   * Load cache entry
   * @param {String} id
   */
  function load(id) {
    return has(id)
      .then(exists => {
        if (!exists) {
          throw new Error(`Cache entry does not exist: "${id}"`)
        }
        return fs.readFileAsync(get(id), 'utf8')
      })
  }

  /**
   * Save cache entry
   * @param {String} id
   * @param {String} data
   */
  function save(id, data) {
    return fs.writeFileAsync(get(id), data)
  }

  return Object.freeze({
    has,
    load,
    save
  })
}
