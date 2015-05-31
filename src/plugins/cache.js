import _ from 'lodash'
import crypto from 'crypto'

const defaults = {
  passthrough: {
    param: 'nocache',
    secret: 'secret'
  },
  PREFIX: 'fs_',
  ttl: 3600,
  path: true,
  query: true,
  params: true,
  languages: false
}

function process(obj) {
  return _.reduce(obj, function(result, item, key) {
    return result + ':' + key + '=' + item
  }, '|')
}

/**
 * Create request hash (cache identifier)
 * @param {Object} req
 * @param {Object} [opts={}]
 * @returns String
 */
function hash(req, opts = {}) {
  let md5 = crypto.createHash('md5')
  let str = ''

  // path
  if (req.path && opts.path) {
    str += req.path
  }

  // query
  if (opts.query) {
    str += process(req.query)
  }

  // params
  if (opts.params) {
    str += process(req.params)
  }

  // language
  if (req.acceptsLanguages() && opts.languages) {
    let langs = req.acceptsLanguages()
    if (_.isArray(langs) && langs.length > 0) {
      str += '|' + langs[0]
    }
  }

  md5.update(str)

  return md5.digest('hex')
}

function request(opts) {

  opts = Object.assign(defaults, opts)

  return async function(req, res) {
    // no cache?
    if (req.query[opts.passthrough.param] &&
      req.query[opts.passthrough.param] === opts.passthrough.secret) {
      return
    }

    const id = hash(req, opts)
    const data = await opts.storage.load(opts.PREFIX + id)

    if (data) {
      res.body = data
      res
        .set('Cache', id)
        .json(JSON.parse(data))

      const err = new Error('Stop stack execution')
      err.nonce = true
      throw err
    }
  }
}

function response(opts) {

  opts = Object.assign(defaults, opts)

  return async function(req, res) {
    if (res.body) {
      const id = hash(req, opts)
      try {
        await opts.storage.save(opts.PREFIX + id, JSON.stringify(res.body))
      } catch (exc) {
        console.warn('Cannot save cache entry: ' + id)
      }
    }
  }
}

export default Object.freeze({
  req: request,
  res: response
})
