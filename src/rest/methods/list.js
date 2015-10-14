import _ from 'lodash'
import dbg from 'debug'
import {
  NotFound,
  InternalServerError,
  Codes
} from 'netiam-errors'
import {getCollectionByIdentity} from '../../db'
import filter from '../odata/filter'
import {normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'

const debug = dbg('netiam:rest:resource:list')

function list(query, queryNormalized) {
  if (queryNormalized.expand.length > 0) {
    query = query.populate(queryNormalized.expand.join(' '))
  }

  query = query
    .sort(queryNormalized.sort)
    .skip(queryNormalized.offset)
    .limit(queryNormalized.limit)

  return query.then(documents => {
    if (!_.isArray(documents)) {
      return []
    }
    return documents
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

      const query = spec.relationship.Model
        .find(spec.queryFilter.toObject())
        .where(spec.relationship.idField)
        .in(document[spec.relationship.field])

      return list(query, spec.queryNormalized)
    })
}

function manyToOne(spec) {
  const {queryFilter} = spec
  const relationshipIdField = spec.relationship.idField
  const relationshipIdParam = spec.req.params[spec.relationship.idParam]

  return spec.relationship.Model
    .findOne({[relationshipIdField]: relationshipIdParam})
    .then(document => {
      if (!document) {
        debug('Base document does not exist')
        throw new NotFound(Codes.E1000, 'Base document does not exist')
      }

      const query = queryFilter
        .where({[spec.relationship.field]: relationshipIdParam})
      return list(query, spec.queryNormalized)
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
 * Fetches database for a list of documents. As all public resource methods,
 * this one provides several predefined parameters someone can use to
 * manipulate the resultset.
 *
 * Example:
 * GET /users?filter=email EQ
 * 'box@mail.tld'&sort=email-&limit=10&offset=1&expand=messages
 *
 * @param {Object} req The request object
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

  const queryFilter = filter(queryNormalized.filter)

  if (relationship) {
    return handleRelationship({
      req,
      queryNormalized,
      queryFilter,
      idField,
      idParam,
      collection,
      relationship
    })
  }

  const query = collection.find(queryFilter.toObject())

  return list(query, queryNormalized)
}
