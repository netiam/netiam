import _ from 'lodash'
import dbg from 'debug'
import async from 'async'
import {params, normalize} from './query'
import filter from './odata/filter'
import * as errors from 'netiam-errors'

const debug = dbg('netiam:rest:resource')

/**
 * A main resource has a list of subresources.
 *
 * Example:
 *
 * ```javascript
 * app.get('/users/:user/projects'
 *   api()
 *    .rest({
 *      idParam: 'user',
 *      collection: User
 *      relationship: hasMany(Project, {field: 'projects'})
 *    })
 * )
 * ```
 *
 * @type {Symbol}
 */
export const ONE_TO_MANY = Symbol('one-to-many')

/**
 * A subresource has a reference to a main resource.
 *
 * Example:
 *
 * ```javascript
 * app.get('/projects/:project/campaigns'
 *   api()
 *    .rest({
 *      collection: Campaign
 *      relationship: belongsTo(Project, {field: 'project', param: 'project'})
 *    })
 * )
 * ```
 *
 * @type {Symbol}
 */
export const MANY_TO_ONE = Symbol('many-to-one')

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

  function listHandle(q, query, resolve, reject) {
    if (query.expand.length > 0) {
      q = q.populate(query.expand.join(' '))
    }

    q = q.sort(query.sort)

    q = q.skip(query.offset)
    if (query.limit && query.limit !== -1) {
      q = q.limit(query.limit)
    }

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
      const query = normalize({
        req,
        idField
      })

      let f = filter(query.filter)

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

            let q
            try {
              q = relationshipCollection.find(f.toObject())
            } catch (err) {
              debug(err)
              reject(
                errors.badRequest(
                  err, [errors.Codes.E3000]))
            }

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

        return listHandle(q, query, resolve, reject)
      }
    })
  }

  function readHandle(q, query, resolve, reject) {
    if (query.expand.length > 0) {
      q = q.populate(query.expand.join(' '))
    }

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
      const query = normalize({
        req,
        idField
      })

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

            const queryOptions = {[idField]: req.params[idParam]}

            const q = relationshipCollection.findOne(queryOptions)

            readHandle(q, query, resolve, reject)
          })

        return
      }

      if (relationship === ONE_TO_MANY) {
        const queryOptions = {[idField]: req.params[idParam]}

        const q = collection.findOne(queryOptions)

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
      const query = normalize({req, idField})

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
    const query = normalize({
      req,
      idField
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

            const queryOptions = {[idField]: req.params[idParam]}

            let q = relationshipCollection.findOne(queryOptions)

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

            reject(
              errors.internalServerError(
                err,
                [errors.Codes.E3000])
            )
          })
        return
      }

      if (relationship === ONE_TO_MANY) {
        const queryOptions = {[idField]: req.params[idParam]}

        const q = collection.findOne(queryOptions)

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
      const queryOptions = {[idField]: req.params[idParam]}

      collection
        .findOneAndRemove(queryOptions)
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
