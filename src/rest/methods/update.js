import _ from 'lodash'
import async from 'async'
import * as errors from 'netiam-errors'
import dbg from 'debug'
import {params, normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:update')

function update(query, queryNormalized, req) {
  return new Promise((resolve, reject) => {
    query
      .then(document => {
        if (!document) {
          return reject(
            errors.notFound('Document not found', [errors.Codes.E3000]))
        }
        Object.assign(document, req.body)
        document
          .save()
          .then(document => {
            if (queryNormalized.expand.length > 0) {
              document.populate(queryNormalized.expand, err => {
                if (err) {
                  return reject(
                    errors.internalServerError(err, [errors.Codes.E3000]))
                }
                resolve(document.toObject())
              })
            } else {
              resolve(document.toObject())
            }
          })
          .catch(err => {
            debug(err)
            if (err.name === 'ValidationError') {
              const errList = []

              _.forEach(err.errors, error => {
                const modError = Object.assign({
                  path: error.path,
                  value: error.value
                }, errors.Codes.E3002)

                errList.push(modError)
              })

              return reject(errors.badRequest(err, errList))
            }

            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          })
      })
      .catch(err => {
        debug(err)
        return reject(errors.internalServerError(err, [errors.Codes.E3000]))
      })
  })
}

function handleRelationship(spec) {
  const {req} = spec
  const {queryNormalized} = spec

  if (ONE_TO_MANY === spec.relationship.type) {
    return new Promise((resolve, reject) => {
      spec.collection
        .findOne(spec.queryOptions)
        .exec((err, document) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          }

          if (!document) {
            return reject(
              errors.notFound('Base document not found', [errors.Codes.E3000]))
          }

          const queryOptions = {
            [spec.relationship.idField]: spec.req.params[spec.relationship.idParam]
          }

          spec.relationship.Model
            .findOne(queryOptions)
            .exec((err, doc) => {
              if (err) {
                return reject(
                  errors.internalServerError(err, [errors.Codes.E3000]))
              }

              if (!doc) {
                return reject(
                  errors.notFound('Document not fund', [errors.Codes.E3000]))
              }

              doc
                .merge(req.body)
                .save(err => {
                  if (err) {
                    debug(err)

                    if (err.name === 'ValidationError') {
                      const errList = []

                      _.forEach(err.errors, error => {
                        const modError = Object.assign({
                          path: error.path,
                          value: error.value
                        }, errors.Codes.E3002)

                        errList.push(modError)
                      })

                      return reject(errors.badRequest(err, errList))
                    }

                    return reject(
                      errors.internalServerError(err, [errors.Codes.E3000]))
                  }

                  if (queryNormalized.expand) {
                    doc.populate(queryNormalized.expand.join(' '), err => {
                      if (err) {
                        return reject(
                          errors.internalServerError(err, [errors.Codes.E3000]))
                      }

                      resolve(doc.toObject())
                    })
                  } else {
                    resolve(doc.toObject())
                  }
                })
            })
        })
    })
  }

  if (MANY_TO_ONE === spec.relationship.type) {
    const relationshipIdField = spec.relationship.idField
    const relationshipIdParam = spec.req.params[spec.relationship.idParam]

    return new Promise((resolve, reject) => {
      spec.relationship.Model
        .findOne({[relationshipIdField]: relationshipIdParam})
        .then(doc => {
          if (!doc) {
            return reject(
              errors.notFound('Document not found', [errors.Codes.E3000]))
          }

          const queryOptions = {[spec.idField]: req.params[spec.idParam]}

          let query = spec.collection.findOne(queryOptions)

          if (queryNormalized.expand.length > 0) {
            query = query.populate(queryNormalized.expand.join(' '))
          }

          return query.exec()
        })
        .then(document => {
          return updateExpanded(Object.assign({document}, spec))
        })
        .then(document => {
          return document
            .merge(spec.req.body)
            .save()
        })
        .then(document => {
          if (queryNormalized.expand.length > 0) {
            return document.populate(queryNormalized.expand.join(' '), err => {
              if (err) {
                return reject(
                  errors.internalServerError(err, [errors.Codes.E3000]))
              }

              resolve(document.toObject())
            })
          }

          resolve(document.toObject())
        })
        .then(null, err => {
          debug(err)

          if (err.name === 'ValidationError') {
            const errList = []

            _.forEach(err.errors, error => {
              const modError = Object.assign({
                path: error.path,
                value: error.value
              }, errors.Codes.E3002)

              errList.push(modError)
            })

            return reject(errors.badRequest(err, errList))
          }

          reject(errors.internalServerError(err, [errors.Codes.E3000]))
        })
    })
  }
}

function updateExpandedPath(spec) {
  const {document} = spec
  const {path} = spec
  const {payload} = spec

  return new Promise((resolve, reject) => {
    const data = document[path]
    const update = payload[path]

    if (_.isArray(data)) {
      async.each(data, (node, done) => {
        const index = data.indexOf(node)
        node
          .merge(update[index])
          .save(done)
      }, err => {
        if (err) {
          debug(err)
          return reject(errors.internalServerError(err, [errors.Codes.E3000]))
        }

        resolve()
      })

      return
    }

    if (_.isObject(data)) {
      data
        .merge(update)
        .save(err => {
          if (err) {
            return reject(errors.internalServerError(err, [errors.Codes.E3000]))
          }

          resolve()
        })
    }
  })
}

function updateExpanded(spec) {
  const {document} = spec
  const {queryNormalized} = spec
  const {req} = spec

  if (!document) {
    throw errors.notFound('Document not found')
  }

  const ops = _.map(queryNormalized.expand, path => {
    return updateExpandedPath(document, path, req.body)
  })

  return Promise
    .all(ops)
    .then(() => {
      return document
    })
}

/**
 * Fetches a single document from database
 *
 * @param {Object} req The request object
 * @returns {Promise}
 */
export default function(spec) {
  const {req} = spec
  const {collection} = spec
  const {relationship} = spec
  const {idField} = spec
  const {idParam} = spec
  const {map} = spec
  const queryNormalized = normalize({
    req,
    idField
  })
  const queryParams = params({
    req,
    map
  })
  const queryOptions = {[idField]: req.params[idParam]}
  if (relationship) {
    return handleRelationship({
      req,
      queryNormalized,
      queryParams,
      queryOptions,
      idField,
      idParam,
      map,
      collection,
      relationship
    })
  }

  const query = collection.findOne(queryOptions)
  return update(query, queryNormalized, req)
}
