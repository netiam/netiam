import _ from 'lodash'
import path from 'path'

export default function profile(opts) {

  opts = Object.assign({
    query: 'profile',
    basedir: './models'
  }, opts)

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
          route.model.modelName.toLowerCase() +
          '.profile.' +
          req.query[opts.query] +
          '.json'
        )
      try {
        schema = require(file)
      } catch (err) {
        return console.error(err)
      }
      res.body = _.pick(res.body, schema)
    }
  }

}
