import * as errors from 'netiam-errors'
import dbg from 'debug'
import {params, normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:remove')

function handleRelationship(spec) {
  if (ONE_TO_MANY === spec.relationship.type) {
    const queryOptions = {
      [spec.relationship.idField]: spec.req.params[spec.relationship.idParam]
    }

    return new Promise((resolve, reject) => {
      spec.collection
        .findOne({[spec.idField]: spec.req.params[spec.idParam]})
        .exec((err, doc) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          }

          if (!doc) {
            return reject(errors.notFound(
              'Base document does not exist', [errors.Codes.E3000]))
          }

          spec.relationship.Model
            .findOneAndRemove(queryOptions)
            .exec((err, document) => {
              if (err) {
                debug(err)
                return reject(
                  errors.internalServerError(err, [errors.Codes.E3000]))
              }

              if (!document) {
                return reject(
                  errors.notFound('Document not found', [errors.Codes.E3000]))
              }

              const index = doc[spec.relationship.field]
                .indexOf(document[spec.relationship.idField])

              if (index === -1) {
                return resolve()
              }

              doc[spec.relationship.field].splice(index, 1)
              doc
                .save(err => {
                  if (err) {
                    return reject(
                      errors.internalServerError(err, [errors.Codes.E3000]))
                  }

                  resolve()
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
        .select(spec.relationship.idField)
        .exec((err, doc) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000]))
          }

          if (!doc) {
            return reject(
              errors.notFound(
                'Document not found',
                [errors.Codes.E3000]))
          }

          const queryOptions = {[spec.idField]: spec.req.params[spec.idParam]}

          spec.collection
            .findOneAndRemove(queryOptions)
            .exec((err, document) => {
              if (err) {
                debug(err)
                return reject(
                  errors.internalServerError(err, [errors.Codes.E3000]))
              }

              if (!document) {
                return reject(
                  errors.notFound('Document not found', [errors.Codes.E3000]))
              }

              resolve()
            })
        })
    })
  }
}

/**
 * Deletes an existing document from database
 *
 * @param {Object} spec
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

  const queryOptions = {[spec.idField]: req.params[spec.idParam]}

  if (relationship) {
    return handleRelationship({
      req,
      queryNormalized,
      queryParams,
      idField,
      idParam,
      map,
      collection,
      relationship
    })
  }

  return collection
    .destroy(queryOptions)
    .then(document => {
      if (!document) {
        throw errors.notFound('Document not found', [errors.Codes.E3000])
      }
    })
}
