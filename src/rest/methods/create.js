import _ from 'lodash'
import dbg from 'debug'
import * as errors from 'netiam-errors'
import {normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:create')

function create(err, document, queryNormalized) {
  return new Promise((resolve, reject)=> {
    if (err) {
      debug(err)
      if (err.code === 11000) {
        return reject(
          errors.badRequest(err, [errors.Codes.E1001]))
      }

      if (err.name === 'ValidationError') {
        const errList = []

        _.forEach(err.errors, error => {
          const modError = Object.assign({
            path: error.path,
            value: error.value
          }, errors.Codes.E3002)

          errList.push(modError)
        })

        return reject(
          errors.badRequest(err, errList))
      }

      return reject(
        errors.internalServerError(err, [errors.Codes.E3000]))
    }

    if (!document) {
      return reject(
        errors.internalServerError(
          'Document could not be created',
          [errors.Codes.E3000]))
    }

    if (queryNormalized.expand.length > 0) {
      document.populate(queryNormalized.expand.join(' '), err => {
        if (err) {
          debug(err)
          return reject(
            errors.internalServerError(err, [errors.Codes.E3000]))
        }

        resolve(document.toObject())
      })
    } else {
      resolve(document.toObject())
    }
  })
}

function handleRelationship(spec) {
  const {req} = spec

  if (ONE_TO_MANY === spec.relationship.type) {
    return new Promise((resolve, reject) => {
      spec.collection
        .findOne({[spec.idField]: spec.req.params[spec.idParam]})
        .exec((err, document) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          }

          if (!document) {
            return reject(errors.notFound(
              'Base document does not exist', [errors.Codes.E3000]))
          }

          spec.relationship.Model
            .create(req.body, (err, doc) => {
              const relationshipField = spec.relationship.field
              const relationshipIdField = spec.relationship.idField

              create(err, doc, spec.queryNormalized)
                .then(doc => {
                  if (!_.isArray(document[relationshipField])) {
                    document[relationshipField] = []
                  }
                  document[relationshipField].push(doc[relationshipIdField])
                  document.save(err => {
                    if (err) {
                      return reject(err)
                    }

                    resolve(doc)
                  })
                })
                .catch(reject)
            })
        })
    })
  }

  if (MANY_TO_ONE === spec.relationship.type) {
    const relationshipIdField = spec.relationship.idField
    const relationshipId = req.params[spec.relationship.idParam]

    return new Promise((resolve, reject) => {
      spec.relationship.Model
        .findOne({[relationshipIdField]: relationshipId})
        .exec((err, document) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000])
            )
          }

          if (!document) {
            return reject(errors.notFound(
              'Base document does not exist', [errors.Codes.E3000]))
          }

          const body = Object.assign(
            {},
            req.body,
            {[spec.relationship.field]: document[relationshipIdField]}
          )

          spec.collection.create(body, (err, doc) => {
            create(err, doc, spec.queryNormalized)
              .then(resolve)
              .catch(reject)
          })
        })
    })
  }
}

/**
 * Creates a new document and saves it to the database.
 *
 * @param {Object} req The request object
 * @returns {Promise}
 */
export default function(spec) {
  const {req} = spec
  const {collection} = spec
  const {idField} = spec
  const {idParam} = spec
  const {relationship} = spec

  const queryNormalized = normalize({
    req,
    idField
  })

  if (relationship) {
    return handleRelationship({
      req,
      collection,
      queryNormalized,
      idField,
      idParam,
      relationship
    })
  }

  return new Promise(resolve => {
    collection.create(req.body, (err, document) => {
      resolve(create(err, document, queryNormalized))
    })
  })
}
