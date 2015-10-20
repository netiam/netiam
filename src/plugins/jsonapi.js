import {
  BadRequest,
  InternalServerError,
  NotImplemented,
  NotFound,
  Codes
} from 'netiam-errors'
import {
  ONE_TO_MANY,
  MANY_TO_ONE
} from '../rest/relationships'
import jsonapi from '../rest/jsonapi'
import {normalize, params} from '../rest/query'
import filter from '../rest/odata/filter'
import {getCollectionByIdentity} from '../db'
import dbg from 'debug'

const debug = dbg('netiam:plugins:jsonapi')

function request() {
  return Promise.reject(
    new NotImplemnted(Codes.E1000, 'jsonapi#request is not implemented'))
}

function response(spec) {
  const collection = getCollectionByIdentity(spec.collection)
  const {relationshipField} = spec
  const relationshipCollection = getCollectionByIdentity(spec.relationshipCollection)
  const {map} = spec
  const {idField = 'id'} = spec
  const {relationship} = spec

  function numTotalDocuments(req, query) {
    // filter
    let f = filter(query.filter)

    // handle relationships
    if (relationship === MANY_TO_ONE &&
      relationshipField &&
      relationshipCollection &&
      map) {

      const key = Object.keys(map)[0]
      const val = req.params[map[key].substr(1)]

      return collection
        .findOne({[key]: val})
        .then(doc => {
          if (!doc) {
            throw new NotFound(Codes.E1000, 'Base document not found')
          }

          // query
          return relationshipCollection
            .count(f.toObject())
            .where({[idField]: doc[relationshipField]})
        })
    }

    if (relationship === ONE_TO_MANY) {
      f = f.where(params({
        req,
        map
      }))

      // query
      return collection.count(f.toObject())
    }

    // query
    // FIXME ONE_TO_MANY and no relationship is different
    return collection.count()
  }

  return (req, res) => {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    const queryNormalized = normalize({
      req,
      idField
    })

    return numTotalDocuments(req, queryNormalized)
      .then(count => {
        try {
          res.body = jsonapi.transform({
            req,
            res,
            count,
            itemsPerPage: queryNormalized.itemsPerPage,
            collection
          })
          res
            .set('Content-Type', 'application/vnd.api+json')
            .json(res.body)
        } catch (err) {
          console.log(err.stack)
          return Promise.reject(new InternalServerError(Codes.E1000, err))
        }
      })
  }

}

export default Object.freeze({
  req: request,
  res: response
})
