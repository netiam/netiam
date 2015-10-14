import {
  BadRequest,
  InternalServerError,
  NotImplemented,
  Codes
} from 'netiam-errors'
import {ONE_TO_MANY, MANY_TO_ONE} from '../rest/resource'
import jsonapi from '../rest/jsonapi'
import {normalize, params} from '../rest/query'
import filter from '../rest/odata/filter'
import dbg from 'debug'

const debug = dbg('netiam:plugins:jsonapi')

function request() {
  throw new NotImplemnted(Codes.E1000, 'jsonapi#request is not implemented')
}

function response(spec) {
  const {collection} = spec
  const {relationshipField} = spec
  const {relationshipCollection} = spec
  const {map} = spec
  const {idField = 'id'} = spec
  const {relationship = ONE_TO_MANY} = spec

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
              reject(new BadRequest(Codes.E1000, err.message))
            }

            // select only related
            q = q.where(idField).in(doc[relationshipField])

            // execute
            q.exec((err, count) => {
              if (err) {
                debug(err)
                return reject(new InternalServerError(Codes.E1000, err.message))
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
          reject(new BadRequest(Codes.E1000, err.message))
        }

        // execute
        q.exec((err, count) => {
          if (err) {
            debug(err)
            return reject(new InternalServerError(Codes.E1000, err.message))
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
      const queryNormalized = normalize({
        req,
        idField
      })

      numTotalDocuments(req, queryNormalized)
        .then(count => {
          res
            .set('Content-Type', 'application/vnd.api+json')
            .json(jsonapi.transform({
              req,
              res,
              count,
              itemsPerPage: queryNormalized.itemsPerPage,
              collection
            }))
        })
        .catch(err => {
          debug(err)
          reject(err)
        })
    })
  }

}

export default Object.freeze({
  req: request,
  res: response
})
