import dbg from 'debug'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'

const debug = dbg('netiam:cache:file')

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
    return new Promise((resolve) => {
      fs.access(get(id), fs.R_OK | fs.W_OK, function(err) {
        if (err) {
          return resolve(false)
        }

        resolve(true)
      })
    })
  }

  /**
   * Load cache entry
   * @param {String} id
   */
  function load(id) {
    return new Promise((resolve, reject) => {
      has(id)
        .then(function(exists) {
          if (!exists) {
            return reject(new Error(`Cache entry does not exist: "${id}"`))
          }

          fs.readFile(get(id), 'utf8', function(err, data) {
            if (err) {
              debug(err)
              return reject(err)
            }

            resolve(data)
          })
        })
        .catch(function() {
          resolve()
        })
    })
  }

  /**
   * Save cache entry
   * @param {String} id
   * @param {String} data
   */
  function save(id, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(get(id), data, function(err) {
        if (err) {
          debug(err)
          return reject(err)
        }

        resolve()
      })
    })
  }

  return Object.freeze({
    has,
    load,
    save
  })
}
