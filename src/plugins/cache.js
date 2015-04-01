import _ from 'lodash'
import B from 'bluebird'
import crypto from 'crypto'

/**
 * Create request hash (cache identifier)
 * @param {Object} req
 * @returns String
 */
function hash(req, opts) {
  let md5 = crypto.createHash('md5')
  let str = ''

  // Path
  if (req.path && opts.path) {
    str += req.path
  }

  // Query
  if (req.query && opts.query) {
    str += _.reduce(req.query, function(result, item, key) {
      return result + ':' + key + '=' + item
    }, '|')
  }

  // Params
  if (req.params && opts.params) {
    str += _.reduce(req.params, function(result, item, key) {
      return result + ':' + key + '=' + item
    }, '|')
  }

  // Language
  if (req.acceptsLanguages() && opts.languages) {
    let langs = req.acceptsLanguages()
    if (_.isArray(langs) && langs.length > 0) {
      str += '|' + langs[0]
    }
  }

  md5.update(str)

  return md5.digest('hex')
}

/**
 * Cache plugin
 * @param {Route} route
 * @param {Object} opts
 * @returns {Function}
 */
function cache(route, opts) {
  let id
  let data

  opts = _.extend({
    storage:     opts.storage,
    passthrough: {
      param:  'nocache',
      secret: 'secret'
    },
    PREFIX:      'fs_',
    ttl:         3600,
    path:        true,
    query:       true,
    params:      true,
    languages:   false
  }, opts)

  route.pre('dispatch', function(req) {
    let deferred = B.pending()

    // no cache?
    if (req.query[opts.passthrough.param] &&
      req.query[opts.passthrough.param] === opts.passthrough.secret) {
      return
    }

    id = hash(req, opts)

    opts.storage.load(opts.PREFIX + id, function(err, raw) {
      if (err) {
        return deferred.resolve()
      }

      if (!raw) {
        opts.storage.save(opts.PREFIX + id, null)
      } else {
        data = raw
      }

      deferred.resolve()
    })

    return deferred.promise
  })

  route.post('dispatch', function(req, res) {
    if (res.body) {
      try {
        opts.storage.save(
          opts.PREFIX + id,
          JSON.stringify(res.body)
        )
      } catch (exc) {
        console.warn('Cannot save cache entry: ' + id)
      }
    }
  })

  return function(req, res) {
    let err

    // no cache?
    if (req.query[opts.passthrough.param] &&
      req.query[opts.passthrough.param] === opts.passthrough.secret) {
      return
    }

    if (id && data) {
      res
        .set('Cache', id)
        .json(JSON.parse(data))

      err = new Error('Stop stack execution')
      err.nonce = true

      throw err
    }
  }

}

export default cache
