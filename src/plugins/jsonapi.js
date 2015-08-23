import _ from 'lodash'
import errors from 'netiam-errors'
import resource,{ONE_TO_MANY, MANY_TO_ONE} from '../rest/resource'
import jsonapi from '../rest/jsonapi'
import {normalize, params} from '../rest/query'
import filter from '../rest/odata/filter'
import dbg from 'debug'

const debug = dbg('netiam:plugins:jsonapi')

function request() {
  throw errors.notImplemnted('jsonapi#request is not implemented')
}

function response(spec) {
  const {collection} = spec
  const {relationshipField} = spec
  const {relationshipCollection} = spec
  const {map} = spec
  let {idField} = spec
  let {relationship} = spec
  let {itemsPerPage} = spec

  idField = idField || '_id'
  relationship = relationship || ONE_TO_MANY
  itemsPerPage = itemsPerPage || 10

  function numTotalDocuments(req, query) {
    return new Promise((resolve, reject) => {

      // filter
      let f = filter(query.filter)

      // handle relationships
      if (relationship === MANY_TO_ONE &&
        relationshipField &&
        relationshipCollection &&
        map) {

        const key = Object.keys(map)[0]
        const val = req.params[map[key].substr(1)]

        collection
          .findOne({[key]: val})
          .select(relationshipField)
          .exec((err, doc) => {
            if (err) {
              debug(err)
              return reject(err)
            }

            if (!doc) {
              return resolve([])
            }

            // query
            let q
            try {
              q = relationshipCollection.count(f.toObject())
            } catch (err) {
              debug(err)
              reject(errors.badRequest(err.message))
            }

            // select only related
            q = q.where('_id').in(doc[relationshipField])

            // execute
            q.exec((err, count) => {
              if (err) {
                debug(err)
                return reject(errors.internalServerError(err.message))
              }

              resolve(count)
            })
          })

        return
      }

      if (relationship === ONE_TO_MANY) {
        f = f.where(params({
          req,
          map
        }))

        // query
        let q
        try {
          q = collection.count(f.toObject())
        } catch (err) {
          debug(err)
          reject(errors.badRequest(err.message))
        }

        // execute
        q.exec((err, count) => {
          if (err) {
            debug(err)
            return reject(errors.internalServerError(err.message))
          }

          resolve(count)
        })
      }
    })
  }

  return (req, res) => {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    return new Promise((resolve, reject) => {
      const query = normalize({
        req,
        idField
      })

      numTotalDocuments(req, query)
        .then(count => {
          res.json(jsonapi.transform({
            req,
            res,
            count,
            itemsPerPage,
            collection
          }))
        })
        .catch(err => {
          reject(err)
        })
    })
  }

}

export default Object.freeze({
  req: request,
  res: response
})
