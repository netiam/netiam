import _ from 'lodash'
import async from 'async'
import dbg from 'debug'
import {
  BadRequest,
  NotFound,
  Codes
} from 'netiam-errors'
import {params, normalize} from '../query'
import {ONE_TO_MANY, MANY_TO_ONE} from '../relationships'
import {getCollectionByIdentity} from '../../db'

const debug = dbg('netiam:rest:resource:update')

function update(query, queryNormalized, req) {
  return query
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Document not found')
      }

      Object.assign(document, req.body)

      return document.save()
    })
    .then(document => {
      if (queryNormalized.expand.length > 0) {
        return document.populate(queryNormalized.expand)
      }

      return document
    })
}

function oneToMany(spec) {
  const {req} = spec
  const {queryNormalized} = spec

  return spec.collection
    .findOne(spec.queryOptions)
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Base document not found')
      }

      const queryOptions = {
        [spec.relationship.idField]: spec.req.params[spec.relationship.idParam]
      }

      return spec.relationship.Model.findOne(queryOptions)
    })
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Document not found')
      }

      return document
        .merge(req.body)
        .save()
    })
    .then(document => {
      if (queryNormalized.expand) {
        return document.populate(queryNormalized.expand.join(' '))
      }

      return document
    })
}

function manyToOne(spec) {
  const {req} = spec
  const {queryNormalized} = spec
  const relationshipIdField = spec.relationship.idField
  const relationshipIdParam = spec.req.params[spec.relationship.idParam]

  return spec.relationship.Model
    .findOne({[relationshipIdField]: relationshipIdParam})
    .then(document => {
      if (!document) {
        throw new NotFound(Codes.E1000, 'Document not found')
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
        .merge(req.body)
        .save()
    })
    .then(document => {
      if (queryNormalized.expand.length > 0) {
        return document.populate(queryNormalized.expand.join(' '))
      }

      return document
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
          return reject(new InternalServerError(Codes.E3000, err))
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
            debug(err)
            return reject(new InternalServerError(Codes.E3000, err))
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
    throw new NotFound(Codes.E3000, 'Document not found')
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
      queryOptions,
      idField,
      idParam,
      collection,
      relationship
    })
  }

  const query = collection.findOne(queryOptions)
  return update(query, queryNormalized, req)
}
