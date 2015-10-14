import _ from 'lodash'
import async from 'async'
import dbg from 'debug'

const debug = dbg('netiam:plugins:state')

function extend(document, user, collection, refField, userField) {
  return new Promise((resolve, reject) => {
    collection.findOne({
      [refField]: document.id,
      [userField]: user.id
    }, function(err, state) {
      if (err) {
        debug(err)
        return reject(err)
      }

      if (!state) {
        return resolve(document)
      }

      const documentWithState = Object.assign(
        state.toObject(),
        document.toObject()
      )

      delete documentWithState[refField]
      delete documentWithState[userField]

      resolve(documentWithState)
    })
  })
}

function handle(data, user, collection, refField, userField, expand = {}) {
  return new Promise((resolve, reject) => {
    if (_.isArray(data)) {
      async.map(
        data,
        (document, done) => {
          const subdocs = []
          _.forEach(expand, (spec, key) => {
            subdocs.push(
              handle(
                document[key],
                user,
                spec.collection,
                spec.refField,
                spec.userField)
            )
          })

          Promise
            .all(subdocs)
            .then(extend(document, user, collection, refField, userField))
            .then((extendedDocument) => {
              done(null, extendedDocument)
            })
            .catch((err) => {
              debug(err)
              done(err)
            })
        },
        (err, extendedDocuments) => {
          if (err) {
            debug(err)
            return reject(err)
          }

          resolve(extendedDocuments)
        }
      )
      return
    }

    if (_.isObject(data)) {
      const subdocs = []
      _.forEach(expand, (spec, key) => {
        subdocs.push(
          handle(
            data[key],
            user,
            spec.collection,
            spec.refField,
            spec.userField)
        )
      })

      Promise
        .all(subdocs)
        .then(extend(data, user, collection, refField, userField))
        .then(function(extendedDocument) {
          resolve(extendedDocument)
        })
        .catch(function(err) {
          debug(err)
          reject(err)
        })
    }
  })
}

/**
 * This plugin can merge user state into existing resource documents
 *
 * @param {Object} spec
 * @returns {Function}
 */
export default function state(spec) {

  const {collection} = spec
  const {refField} = spec
  const {expand} = spec
  const {userField = 'owner'} = spec

  return function(req, res) {
    return handle(res.body, req.user, collection, refField, userField, expand)
  }
}
