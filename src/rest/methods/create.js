import _ from 'lodash'
import HTTPError,{
  BadRequest,
  NotFound,
  InternalServerError,
  Codes
} from 'netiam-errors'
import {normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'
import {getCollectionByIdentity} from '../../db'

function create(collection, document, queryNormalized) {
  if (!document) {
    throw new InternalServerError(Codes.E1000, 'Document could not be created')
  }

  if (queryNormalized.expand.length > 0) {
    return collection
      .find(document)
      .populate(queryNormalized.expand)
  }

  return Promise.resolve(document)
}

function oneToMany(spec) {
  let baseDocument

  return spec.collection
    .findOne({[spec.idField]: spec.req.params[spec.idParam]})
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Base document does not exist')
      }

      baseDocument = document
      return spec.relationship.Model.create(req.body)
    })
    .then(document => {
      return create(document, spec.queryNormalized)
    })
    .then(document => {
      const relationshipField = spec.relationship.field
      const relationshipIdField = spec.relationship.idField

      if (!document) {
        throw new InternalServerError(Codes.E1000, 'Cannot created document')
      }

      if (!_.isArray(baseDocument[relationshipField])) {
        baseDocument[relationshipField] = []
      }
      baseDocument[relationshipField].push(document[relationshipIdField])

      return baseDocument
        .save()
        .then(() => {
          return document
        })
    })
}

function manyToOne(spec) {
  const relationshipIdField = spec.relationship.idField
  const relationshipId = req.params[spec.relationship.idParam]

  return spec.relationship.Model
    .findOne({[relationshipIdField]: relationshipId})
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Base document does not exist')
      }

      const body = Object.assign(
        req.body,
        {[spec.relationship.field]: document[relationshipIdField]}
      )
      return spec.collection.create(body)
    })
    .then(document => {
      return create(document, spec.queryNormalized)
    })
}

function handleRelationship(spec) {
  if (ONE_TO_MANY === spec.relationship.type) {
    return oneToMany(spec)
  }

  if (MANY_TO_ONE === spec.relationship.type) {
    return manyToOne(spec)
  }
}

/**
 * Creates a new document and saves it to the database.
 *
 * @param {Object} spec The spec object
 * @returns {Promise}
 */
export default function(spec) {
  const {req} = spec
  const collection = getCollectionByIdentity(spec.collection)
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

  return collection
    .create(req.body)
    .then(document => {
      return create(collection, document, queryNormalized)
    })
    .catch(err => {
      if (err.code === 'E_VALIDATION') {
        const errors = [err.invalidAttributes]
        return Promise.reject(
          new HTTPError(400, Codes.E1000, 'A validation error occured', errors))
      }
      return Promise.reject(err)
    })
}
