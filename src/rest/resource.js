import _ from 'lodash'
import dbg from 'debug'
import async from 'async'
import filter from './odata/filter'
import * as errors from 'netiam-errors'

const debug = dbg('netiam:rest:resource')

export const MANY_TO_ONE = Symbol('many-to-one')
export const ONE_TO_MANY = Symbol('one-to-many')

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

  const itemsPerPage = 10

  /**
   * Normalize the request query. The resource routes do access certain query
   * parameters, neither they are set or not.
   * @param {Object} query The original query object
   * @returns {Object} The normalized query object
   * @private
   */
  function normalize(query) {
    // Clone query object
    query = _.clone(query)

    // Filter
    if (!query.filter) {
      query.filter = ''
    }

    // Property expansion
    if (_.isString(query.expand)) {
      query.expand = query.expand.split(',')
    } else {
      query.expand = []
    }

    // Order
    if (!query.sort) {
      query.sort = idField
    }

    // Pagination
    if (!query.offset) {
      query.offset = 0
    } else {
      query.offset = Number(query.offset)
    }
    if (!query.limit) {
      query.limit = 10
    } else {
      query.limit = Number(query.limit)
    }

    if (query.page) {
      query.page = Number(query.page || 1)
      query.limit = itemsPerPage
      query.offset = Math.max(0, (query.page - 1) * itemsPerPage)
    }

    return query
  }

  /**
   * Maps request parameters to a properties hash object which can be
   * used to create a filter expression for database queries. This method
   * is also used to constraint requests to subresources.
   *
   * The following example tries to fetch messages from a specific user.
   * In order to reduce the messages within the database, there must be some
   * kind of 1:n relationship between a user and its messages.
   *
   * The mapping allows you to define a dynamic relationship between a parameter
   * and a specific document property. Internal this mapping is used to reduce
   * the resultset of documents by adding a $where statement to the database
   * query.
   *
   * Example:
   * // Request
   * GET /users/:user/messages
   *
   * // Mapping
   * {
   *  'owner': ':user'
   * }
   *
   * @param {Object} parameters
   * @returns {Object}
   * @private
   */
  function params(parameters) {
    const newMap = _.clone(map)

    return _.forOwn(newMap, (val, key, obj) => {
      // handle route params
      if (val.charAt(0) === ':') {
        obj[key] = parameters[val.substring(1)]
        return
      }

      // Static value
      obj[key] = val
    })
  }

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
        return reject(
          errors.internalServerError(
            err,
            [errors.Codes.E3000]))
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
      // normalize
      const query = normalize(req.query)

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
              return reject(
                errors.internalServerError(
                  err,
                  [errors.Codes.E3000]))
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
              reject(
                errors.badRequest(
                  err, [errors.Codes.E3000]))
            }

            // select only related
            q = q.where('_id').in(doc[relationshipField])

            // handle
            listHandle(q, query, resolve, reject)
          })

        return
      }

      if (relationship === ONE_TO_MANY) {
        f = f.where(params(req.params))

        // query
        let q
        try {
          q = collection.find(f.toObject())
        } catch (err) {
          debug(err)
          reject(
            errors.badRequest(
              err,
              [errors.Codes.E3000]))
        }

        // handle
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
        return reject(
          errors.internalServerError(
            err,
            [errors.Codes.E3000]))
      }

      if (!document) {
        return reject(
          errors.notFound(
            'Document not found',
            [errors.Codes.E3000]))
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
      // normalize
      const query = normalize(req.query)

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
              return reject(
                errors.internalServerError(
                  err,
                  [errors.Codes.E3000]))
            }

            if (!doc) {
              return reject(
                errors.notFound(
                  'Document not found',
                  [errors.Codes.E3000]))
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
      const query = normalize(req.query)

      // create model
      collection
        .create(req.body, (err, document) => {
          if (err) {
            debug(err)
            if (err.code === 11000) {
              return reject(
                errors.badRequest(
                  err,
                  [errors.Codes.E1001]))
            }

            if (err.name === 'ValidationError') {
              const errList = []

              _.forEach(err.errors, error => {
                const modError = Object.assign({
                  path: error.path,
                  value: error.value
                }, errors.Codes.E3002)

                errList.push(modError)
              })

              return reject(
                errors.badRequest(
                  err,
                  errList))
            }

            return reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000]))
          }

          if (!document) {
            return reject(
              errors.internalServerError(
                'Document could not be created',
                [errors.Codes.E3000]))
          }

          // populate
          if (query.expand.length > 0) {
            document.populate(query.expand.join(' '), err => {
              if (err) {
                debug(err)
                return reject(
                  errors.internalServerError(
                    err,
                    [errors.Codes.E3000]))
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
              return reject(
                errors.internalServerError(
                  err,
                  [errors.Codes.E3000]))
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
              return reject(
                errors.internalServerError(
                  err,
                  [errors.Codes.E3000]))
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
    // normalize
    const query = normalize(req.query)

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
                    return reject(
                      errors.internalServerError(
                        err,
                        [errors.Codes.E3000]))
                  }

                  resolve(document.toJSON())
                })
            }
            resolve(document.toJSON())
          })
          .then(null, err => {
            debug(err)
            reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000])
            )
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
            return reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000]))
          }
          if (!document) {
            return reject(
              errors.notFound(
                'Document not found',
                [errors.Codes.E3000]))
          }

          document
            .merge(req.body)
            .save(err => {
              if (err) {
                debug(err)
                return reject(
                  errors.internalServerError(
                    err,
                    [errors.Codes.E3000]))
              }

              // populate
              if (req.query.expand) {
                document.populate(query.expand.join(' '), err => {
                  if (err) {
                    return reject(
                      errors.internalServerError(
                        err,
                        [errors.Codes.E3000]))
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
            return reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000]))
          }
          if (!documents) {
            return reject(
              errors.notFound(
                'Document not found',
                [errors.Codes.E3000]))
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
