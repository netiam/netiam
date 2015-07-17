import _ from 'lodash'
import async from 'async'
import dbg from 'debug'

const debug = dbg('netiam:plugins:state')

/**
 * This plugin can merge user state into existing resource documents
 *
 * @param {Object} spec
 * @returns {Function}
 */
export default function state(spec) {

  const {collection} = spec
  const {refField} = spec
  let {userField} = spec

  userField = userField || 'owner'
  //const {expand} = spec

  return function(req, res) {
    return new Promise((resolve, reject) => {
      if (!req.user) {
        return resolve()
      }

      function extendDocument(document, done) {
        collection.findOne({
          [refField]: document.id,
          [userField]: req.user.id
        }, function(err, state) {
          if (err) {
            debug(err)
            return done(err)
          }

          if (!state) {
            return done(null, document)
          }

          const mergedDocument = Object.assign(
            state.toObject(),
            document.toObject()
          )

          delete mergedDocument[refField]
          delete mergedDocument[userField]

          return done(null, mergedDocument)
        })
      }

      if (_.isArray(res.body)) {
        async.map(res.body, extendDocument, function(err, documents) {
          if (err) {
            debug(err)
            return reject(err)
          }

          res.body = documents

          resolve()
        })
        return
      }

      if (_.isObject(res.body)) {
        extendDocument(res.body, function(err, document) {
          if (err) {
            debug(err)
            return reject(err)
          }

          res.body = document

          resolve()
        })
        return
      }

      resolve()
    })

  }
}
