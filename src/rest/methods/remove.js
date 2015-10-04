import dbg from 'debug'
import {
  NotFound,
  Codes
} from 'netiam-errors'
import {normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:remove')

function oneToMany(spec) {
  const queryOptions = {
    [spec.relationship.idField]: spec.req.params[spec.relationship.idParam]
  }

  return spec.collection
    .findOne({[spec.idField]: spec.req.params[spec.idParam]})
    .then(document => {
      if (!document) {
        debug('Base document does not exist')
        throw new NotFound(Codes.E1000, 'Base document does not exist')
      }
      return spec.relationship.Model.findOneAndRemove(queryOptions)
    })
    .then(document => {
      if (!document) {
        debug('Document not found')
        throw new NotFound(Codes.E1000, 'Document not found')
      }

      const index = doc[spec.relationship.field]
        .indexOf(document[spec.relationship.idField])

      if (index === -1) {
        return resolve()
      }

      doc[spec.relationship.field].splice(index, 1)
      return doc.save()
    })
}

function manyToOne(spec) {
  const relationshipIdField = spec.relationship.idField
  const relationshipIdParam = spec.req.params[spec.relationship.idParam]

  return spec.relationship.Model
    .findOne({[relationshipIdField]: relationshipIdParam})
    .select(spec.relationship.idField)
    .then(document => {
      if (!document) {
        debug('Document not found')
        throw new NotFound(Codes.E1000, 'Document not found')
      }

      const queryOptions = {[spec.idField]: spec.req.params[spec.idParam]}
      return spec.collection.findOneAndRemove(queryOptions)
    })
    .then(document => {
      if (!document) {
        debug('Document not found')
        throw new NotFound(Codes.E1000, 'Document not found')
      }
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
  const queryOptions = {[spec.idField]: req.params[spec.idParam]}

  if (relationship) {
    return handleRelationship({
      req,
      idField,
      idParam,
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
