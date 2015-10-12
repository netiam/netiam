import dbg from 'debug'
import {
  NotFound,
  InternalServerError,
  Codes
} from 'netiam-errors'
import {normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'
import {getCollectionByIdentity} from '../../db'

const debug = dbg('netiam:rest:resource:read')

function read(query, queryNormalized) {
  if (queryNormalized.expand.length > 0) {
    query = query.populate(queryNormalized.expand)
  }

  return query
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Document not found')
      }
      return document
    })
}

function oneToMany(spec) {
  return spec.collection
    .findOne({[spec.idField]: spec.req.params[spec.idParam]})
    .then(document => {
      if (!document) {
        debug('Base document does not exist')
        throw new NotFound(Codes.E1000, 'Base document does not exist')
      }

      const queryOptions = {
        [spec.relationship.idField]: spec.req.params[spec.relationship.idParam]
      }
      const query = spec.relationship.Model.findOne(queryOptions)
      return read(query, spec.queryNormalized)
    })
}

function manyToOne(spec) {
  const relationshipIdField = spec.relationship.idField
  const relationshipIdParam = spec.req.params[spec.relationship.idParam]

  return spec.relationship.Model
    .findOne({[relationshipIdField]: relationshipIdParam})
    .select(spec.relationship.field)
    .then(document => {
      if (!document) {
        debug('Document does not exist')
        throw new NotFound(Codes.E1000, 'Document does not exist')
      }

      const query = spec.collection.findOne(spec.queryOptions)
      return read(query, spec.queryNormalized)
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
 * Fetches a single document from database
 *
 * @param {Object} spec The spec object
 * @returns {Promise}
 */
export default function(spec) {
  const {req} = spec
  const collection = getCollectionByIdentity(spec.collection)
  const {relationship} = spec
  const {idField} = spec
  const {idParam} = spec
  const queryNormalized = normalize({
    req,
    idField
  })

  const queryOptions = {[idField]: req.params[idParam]}

  if (relationship) {
    return handleRelationship({
      req,
      queryNormalized,
      idField,
      idParam,
      collection,
      relationship
    })
  }

  const query = collection.findOne(queryOptions)
  return read(query, queryNormalized)
}
