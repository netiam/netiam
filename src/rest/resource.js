import _ from 'lodash'
import dbg from 'debug'
import async from 'async'
import {params, normalize} from './query'
import filter from './odata/filter'
import * as errors from 'netiam-errors'

const debug = dbg('netiam:rest:resource')

export const MANY_TO_ONE = Symbol('many-to-one')
export const ONE_TO_MANY = Symbol('one-to-many')

let itemsPerPage = 10

export default function resource(spec) {
  const {collection} = spec
  const {relationshipField} = spec
  const {relationshipCollection} = spec
  const {map} = spec
  let {relationship} = spec
  let {idParam} = spec
  let {idField} = spec

  idParam = idParam || 'id'
  idField = idField || '_id'
  relationship = relationship || ONE_TO_MANY
  itemsPerPage = spec.itemsPerPage ? spec.itemsPerPage : itemsPerPage

  function listHandle(q, query, resolve, reject) {
    // populate
    if (query.expand.length > 0) {
      q = q.populate(query.expand.join(' '))
    }

    // sort
    q = q.sort(query.sort)

    // pagination
    q = q.skip(query.offset)
    if (query.limit && query.limit !== -1) {
      q = q.limit(query.limit)
    }

    // execute
    q.exec((err, documents) => {
      if (err) {
        debug(err)
        return reject(errors.internalServerError(err.message))
      }

      if (!_.isArray(documents)) {
        return resolve([])
      }

      resolve(_.map(documents, document => {
        return document.toObject()
      }))
    })
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
  function list(req) {
    return new Promise((resolve, reject) => {
      const query = normalize({
        req,
        idField,
        itemsPerPage
      })

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
              q = relationshipCollection.find(f.toObject())
            } catch (err) {
              debug(err)
              reject(errors.badRequest(err.message))
            }

            // select only related
            q = q.where('_id').in(doc[relationshipField])

            listHandle(q, query, resolve, reject)
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
          q = collection.find(f.toObject())
        } catch (err) {
          debug(err)
          reject(errors.badRequest(err.message))
        }

        return listHandle(q, query, resolve, reject)
      }
    })
  }

  function readHandle(q, query, resolve, reject) {
    // populate
    if (query.expand.length > 0) {
      q = q.populate(query.expand.join(' '))
    }

    // execute
    q.exec((err, document) => {
      if (err) {
        debug(err)
        return reject(errors.internalServerError(err.message))
      }

      if (!document) {
        return reject(errors.notFound('Document not found'))
      }

      resolve(document.toObject())
    })
  }

  /**
   * Fetches a single document from database.
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function read(req) {
    return new Promise((resolve, reject) => {
      const query = normalize({
        req,
        idField,
        itemsPerPage
      })

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
              return reject(errors.notFound('Document not found'))
            }

            // query options
            const qo = {[idField]: req.params[idParam]}

            // query
            const q = relationshipCollection.findOne(qo)

            // handle
            readHandle(q, query, resolve, reject)
          })

        return
      }

      if (relationship === ONE_TO_MANY) {
        // query options
        const qo = {[idField]: req.params[idParam]}

        // query
        const q = collection.findOne(qo)

        // handle
        return readHandle(q, query, resolve, reject)
      }

    })
  }

  /**
   * Creates a new document and saves it to the database.
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function create(req) {
    return new Promise((resolve, reject) => {
      // normalize
      const query = normalize({
        req,
        idField,
        itemsPerPage
      })

      // create model
      collection
        .create(req.body, (err, document) => {
          if (err) {
            debug(err)
            if (err.code === 11000) {
              return reject(errors.badRequest(err.message))
            }

            return reject(errors.internalServerError(err.message))
          }

          if (!document) {
            return reject(errors.internalServerError('Document could not be created'))
          }

          // populate
          if (query.expand.length > 0) {
            document.populate(query.expand.join(' '), err => {
              if (err) {
                debug(err)
                return reject(errors.internalServerError(err.message))
              }

              resolve(document.toJSON())
            })
          } else {
            resolve(document.toJSON())
          }
        })
    })
  }

  function updateExpandedPath(document, path, payload) {
    return new Promise((resolve, reject) => {
      const data = document[path]
      const update = payload[path]

      if (_.isArray(data)) {
        async.each(
          data,
          (node, done) => {
            const index = data.indexOf(node)
            node
              .merge(update[index])
              .save(done)
          },
          (err) => {
            if (err) {
              debug(err)
              return reject(err)
            }

            return resolve()
          })
        return
      }

      if (_.isObject(data)) {
        data
          .merge(update)
          .save(err => {
            if (err) {
              return reject(err)
            }

            resolve()
          })
      }
    })
  }

  /**
   * Modifies a single and existing document
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function update(req) {
    const query = normalize({
      req,
      idField,
      itemsPerPage
    })

    function updateExpanded(document) {
      if (!document) {
        throw errors.notFound('Document not found')
      }
      const ops = _.map(query.expand, path => {
        return updateExpandedPath(document, path, req.body)
      })

      return Promise
        .all(ops)
        .then(() => {
          return document
        })
    }

    return new Promise((resolve, reject) => {
      // handle relationships
      if (relationship === MANY_TO_ONE &&
        relationshipField &&
        relationshipCollection &&
        map) {

        const key = Object.keys(map)[0]
        const val = req.params[map[key].substr(1)]

        collection
          .findOne({[key]: val})
          .select(relationshipField).exec()
          .then(doc => {
            if (!doc) {
              throw errors.notFound('Document not found')
            }

            // query options
            const qo = {[idField]: req.params[idParam]}

            // query
            let q = relationshipCollection.findOne(qo)

            // populate
            if (query.expand.length > 0) {
              q = q.populate(query.expand.join(' '))
            }

            return q.exec()
          })
          .then(updateExpanded)
          .then(document => {
            return document
              .merge(req.body)
              .save()
          })
          .then(document => {
            if (req.query.expand) {
              return document
                .populate(query.expand.join(' '), err => {
                  if (err) {
                    return reject(err)
                  }

                  resolve(document.toJSON())
                })
            }
            resolve(document.toJSON())
          })
          .then(null, err => {
            debug(err)
            reject(err)
          })
        return
      }

      if (relationship === ONE_TO_MANY) {
        // query
        const qo = {[idField]: req.params[idParam]}

        // Build query
        const q = collection.findOne(qo)

        // Execute query
        q.exec((err, document) => {
          if (err) {
            debug(err)
            return reject(errors.internalServerError(err.message))
          }
          if (!document) {
            return reject(errors.notFound('Document not found'))
          }

          document
            .merge(req.body)
            .save(err => {
              if (err) {
                debug(err)
                return reject(errors.internalServerError(err.message))
              }

              // populate
              if (req.query.expand) {
                document.populate(query.expand.join(' '), err => {
                  if (err) {
                    return reject(errors.internalServerError(err.message))
                  }

                  resolve(document.toJSON())
                })
              } else {
                resolve(document.toJSON())
              }
            })
        })
      }

    })
  }

  /**
   * Deletes an existing document from database
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function remove(req) {
    return new Promise((resolve, reject) => {
      // query options
      const qo = {[idField]: req.params[idParam]}

      collection
        .findOneAndRemove(qo)
        .exec((err, documents) => {
          if (err) {
            debug(err)
            return reject(errors.internalServerError(err.message))
          }
          if (!documents) {
            return reject(errors.notFound('Document not found'))
          }

          resolve()
        })

    })
  }

  return Object.freeze({
    list,
    read,
    create,
    update,
    remove
  })
}
