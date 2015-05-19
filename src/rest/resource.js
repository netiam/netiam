import _ from 'lodash'
import filter from './odata/filter'
import RESTError from './error'

export const MANY_TO_ONE = Symbol('many-to-one')
export const ONE_TO_MANY = Symbol('one-to-many')

export default function resource(spec) {
  let {collection} = spec
  let {idParam} = spec
  let {idField} = spec
  let {map} = spec
  let {relationship} = spec

  idParam = idParam || 'id'
  idField = idField || '_id'
  relationship = relationship || ONE_TO_MANY

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
    if (query.expand) {
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
   * @param {Object} params
   * @returns {Object}
   * @private
   */
  function params(params) {
    map = _.clone(map)

    return _.forOwn(_.clone(map), function(val, key, obj) {
      // handle route params
      if (val.charAt(0) === ':') {
        obj[key] = params[val.substring(1)]
        return
      }

      // Static value
      obj[key] = val
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
      let query = normalize(req.query)

      // filter
      let f = filter(query.filter).where(params(req.params))

      // query
      let q = collection.find(f.toObject())

      // populate
      query.expand.forEach(function(field) {
        q = q.populate(field)
      })

      // sort
      q = q.sort(query.sort)

      // pagination
      q = q.skip(query.offset)
      if (query.limit && query.limit !== -1) {
        q = q.limit(query.limit)
      }

      // execute
      q.exec(function(err, documents) {
        if (err) {
          return reject(new RESTError(err, 500))
        }

        if (!_.isArray(documents)) {
          return resolve([])
        }

        resolve(documents)
      })
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
      let query = normalize(req.query)

      // query options
      let qo = {}
      qo[idField] = req.params[idParam]

      // query
      let q = collection.findOne(qo)

      // populate
      query.expand.forEach(function(field) {
        q = q.populate(field)
      })

      // execute
      q.exec(function(err, document) {
        if (err) {
          return reject(new RESTError(err, 500))
        }
        if (!document) {
          return reject(new RESTError('Document not found', 404))
        }

        resolve(document)
      })
    })
  }

  /**
   * Creates a new document and save it to the database.
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function create(req) {
    return new Promise((resolve, reject) => {
      // normalize
      let query = normalize(req.query)

      // handle relationship
      if (map) {
        let key = Object.keys(map)[0]
        if (relationship === ONE_TO_MANY && map) {
          req.body[key] = req.params[map[key].substr(1)]
        }

        if (relationship === MANY_TO_ONE && map) {
          reject(new Error('MANY_TO_ONE relationships are not supported'))
        }

      }

      // create model
      collection.create(req.body, function(err, documents) {
        if (err) {
          return reject(new RESTError(err, 500))
        }
        if (!documents) {
          return reject(new RESTError('Document could not be created', 500))
        }

        // populate
        if (query.expand.length > 0) {
          documents.populate(query.expand.join(' '), function() {
            resolve(documents)
          })
        } else {
          resolve(documents)
        }
      })
    })
  }

  /**
   * Modifies a single and existing document
   *
   * @param {Object} req The request object
   * @returns {Promise}
   */
  function update(req) {
    return new Promise((resolve, reject) => {
      // normalize
      let query = normalize(req.query)

      // query
      let qo = {}
      qo[idField] = req.params[idParam]

      // Build query
      let q = collection.findOne(qo)

      // Execute query
      q.exec(function(err, document) {
        if (err) {
          return reject(new RESTError(err, 500))
        }
        if (!document) {
          return reject(new RESTError('Document Not Found', 404))
        }

        document
          .merge(req.body)
          .save(function(err) {
            if (err) {
              return reject(new RESTError(err, 500))
            }

            // Populate
            if (req.query.expand) {
              document.populate(query.expand.join(' '), function() {
                resolve(document)
              })
            } else {
              resolve(document)
            }
          })
      })
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
      let qo = {}

      // Query Options
      qo[idField] = req.params[idParam]
      collection.findOneAndRemove(qo, function(err, documents) {
        if (err) {
          return reject(new RESTError(err, 500))
        }
        if (!documents) {
          return reject(new RESTError('Document not found', 404))
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
