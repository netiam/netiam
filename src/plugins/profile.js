import _ from 'lodash'
import dbg from 'debug'
import path from 'path'

const debug = dbg('netiam:plugins:profile')

export default function profile(opts) {

  opts = Object.assign({
    query: 'profile',
    basedir: './models'
  }, opts)

  let {collection} = opts

  if (!collection) {
    throw new Error('Collection must be defined')
  }

  /**
   * @scope {Resource}
   * @param {Object} req
   * @param {Object} res
   * @returns {*}
   */
  return function(req, res) {
    let file
    let schema

    if (req.query[opts.query] && req.query[opts.query] !== 'default') {
      // TODO Load profiles during start time
      file =
        path.join(
          path.dirname(require.main.filename),
          opts.basedir,
          collection.modelName.toLowerCase() +
          '.profile.' +
          req.query[opts.query] +
          '.json'
        )
      try {
        schema = require(file)
      } catch (err) {
        debug(err)
      }
      res.body = _.pick(res.body, schema)
    }
  }

}
