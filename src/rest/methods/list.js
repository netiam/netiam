import _ from 'lodash'
import dbg from 'debug'
import {
  NotFound,
  InternalServerError,
  Codes
} from 'netiam-errors'
import filter from '../odata/filter'
import {params, normalize} from '../query'
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
    return _.map(documents, document => document.toObject())
  })
}

function handleRelationship(spec) {
  if (ONE_TO_MANY === spec.relationship.type) {
    return new Promise((resolve, reject) => {
      spec.collection
        .findOne({[spec.idField]: spec.req.params[spec.idParam]})
        .exec((err, doc) => {
          if (err) {
            debug(err)
            return reject(new InternalServerError(Codes.E1000, err))
          }

          if (!doc) {
            return reject(
              new NotFound(Codes.E1000, 'Base document does not exist'))
          }

          const query = spec.relationship.Model
            .find(spec.queryFilter.toObject())
            .where(spec.relationship.idField)
            .in(doc[spec.relationship.field])

          resolve(
            list(query, spec.queryNormalized))
        })
    })
  }

  if (MANY_TO_ONE === spec.relationship.type) {
    let queryFilter = spec.queryFilter
    const relationshipIdField = spec.relationship.idField
    const relationshipIdParam = spec.req.params[spec.relationship.idParam]

    return new Promise((resolve, reject) => {
      spec.relationship.Model
        .findOne({[relationshipIdField]: relationshipIdParam})
        //.select(spec.relationship.field)
        .exec((err, doc) => {
          if (err) {
            debug(err)
            return reject(
              errors.internalServerError(err, [errors.Codes.E3000]))
          }

          if (!doc) {
            return resolve([])
          }

          queryFilter.where({[spec.relationship.field]: relationshipIdParam})

          const query = spec.collection.find(queryFilter.toObject())

          resolve(
            list(query, spec.queryNormalized))
        })
    })
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
