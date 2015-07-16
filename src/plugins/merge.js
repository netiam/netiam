import dbg from 'debug'
import _ from 'lodash'
import * as errors from '../rest/error'

const debug = dbg('netiam:plugins:merge')

export default function merge(spec) {
  const {collection} = spec
  const {idField} = spec
  let {idParam} = spec
  let {foreignIdField} = spec

  idParam = idParam || 'id'
  foreignIdField = foreignIdField || 'id'

  return function(req, res) {
    const method = req.method

    return new Promise((resolve, reject) => {
      if (method === 'GET' && !req.params[idParam]) {
        return reject(errors.notImplemented(method + ' has not been implemented to merge'))
        /*
        collection
          .find({[idField]: req.params[idParam]})
          .exec(function(err, documents) {
            if (err) {
              return reject(errors.internalServerError(err.message))
            }

            if (!_.isArray(res.body)) {
              return reject(errors.notFound('No documents to merge'))
            }

            // documents as ID-map
            if (_.isArray(documents)) {
              const map = []

              documents.forEach(function(document) {
                const id = document[idField]
                map[id] = document.toObject()
              })

              // merge data
              res.body = res.body.map(function(document) {
                return Object.assign(document.toObject(), map[document[foreignIdField]])
              })
            }

            resolve()
          })
        return
        */
      }

      if (method === 'POST') {
        return reject(errors.notImplemented(method + ' has not been implemented to merge'))
      }

      if (method === 'GET') {
        collection
          .findOne({[idField]: req.params[idParam]})
          .exec(function(err, document) {
            if (err) {
              debug(err)
              return reject(errors.internalServerError(err.message))
            }

            if (!_.isObject(res.body)) {
              return reject(errors.notFound('No document to merge'))
            }

            // documents as ID-map
            if (_.isObject(document)) {
              // merge data
              res.body = Object.assign(res.body.toObject(), document.toObject())
            }

            resolve()
          })
        return
      }

      if (method === 'PUT') {
        return reject(errors.notImplemented(method + ' has not been implemented to merge'))
      }

      return reject(errors.notImplemented(method + ' has not been implemented to merge'))
    })

  }
}
