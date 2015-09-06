import * as errors from 'netiam-errors'
import dbg from 'debug'
import {params, normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:read')

function read(query, queryNormalized) {
  return new Promise((resolve, reject) => {
    if (queryNormalized.expand.length > 0) {
      query = query.populate(queryNormalized.expand.join(' '))
    }

    query.exec((err, document) => {
      if (err) {
        debug(err)
        return reject(
          errors.internalServerError(
            err,
            [errors.Codes.E3000]))
      }

      if (!document) {
        return reject(
          errors.notFound(
            'Document not found',
            [errors.Codes.E3000]))
      }

      resolve(document.toObject())
    })
  })
}

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

          const query = spec.relationship.Model.findOne(queryOptions)

          resolve(
            read(query, spec.queryNormalized))
        })
    })
  }

  if (MANY_TO_ONE === spec.relationship.type) {
    const relationshipIdField = spec.relationship.idField
    const relationshipIdParam = spec.req.params[spec.relationship.idParam]

    return new Promise((resolve, reject) => {
      spec.relationship.Model
        .findOne({[relationshipIdField]: relationshipIdParam})
        .select(spec.relationship.field)
        .exec((err, doc) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          }

          if (!doc) {
            return reject(
              errors.notFound(
                'Document not found',
                [errors.Codes.E3000]))
          }

          const query = spec.collection.findOne(spec.queryOptions)

          resolve(
            read(query, spec.queryNormalized))
        })
    })
  }
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
      map,
      idField,
      idParam,
      collection,
      relationship
    })
  }

  const query = collection.findOne(queryOptions)
  return read(query, queryNormalized)
}
