import _ from 'lodash'
import dbg from 'debug'
import path from 'path'

const debug = dbg('netiam:plugins:profile')

export default function profile(spec) {
  const {query = 'profile'} = spec
  const {basedir = './models'} = spec
  const {collection} = spec

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

    if (req.query[query] && req.query[query] !== 'default') {
      // TODO Load profiles during start time
      file =
        path.join(
          path.dirname(require.main.filename),
          basedir,
          collection.modelName.toLowerCase() +
          '.profile.' +
          req.query[query] +
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
