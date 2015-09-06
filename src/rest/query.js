import _ from 'lodash'
import dbg from 'debug'

const debug = dbg('netiam:rest:query')

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
 * and a specific document property. Within the lib this mapping function is
 * used to reduce the resultset of documents by adding a $where statement to
 * the database query.
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
 * @param {Object} spec
 * @param {Object} spec.req
 * @param {Object} [spec.map={}]
 * @returns {Object}
 */
export function params(spec) {
  const req = spec.req
  const _map = _.isObject(spec.map) ? _.clone(spec.map) : {}

  if (!req || !req.params) {
    const err = new Error('Either the request object itself or the request.params object does not exist')
    debug(err)
    throw err
  }

  const _params = _.clone(req.params)

  return _.forOwn(_map, (val, key, mapped) => {
    // handle route params
    if (val.charAt(0) === ':') {
      mapped[key] = _params[val.substring(1)]
      return
    }

    // Static value
    mapped[key] = val
  })
}

/**
 * Normalize the request query. The resource routes do access certain query
 * parameters, neither they are set or not.
 * @param {Object} spec Options
 * @param {Object} spec.req The request object
 * @param {String} [spec.idField="id"] The ID field
 * @returns {Object} The normalized query object
 */
export function normalize(spec) {
  const req = spec.req
  const idField = spec.idField

  if (!req || !req.query) {
    const err = new Error('Either the request object itself or the request.query object does not exist')
    debug(err)
    throw err
  }

  // Clone query object
  const query = _.clone(req.query)

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
  if (query.itemsPerPage) {
    query.itemsPerPage = Number(query.itemsPerPage)
  } else {
    query.itemsPerPage = 10
  }

  if (!query.offset) {
    query.offset = 0
  } else {
    query.offset = Number(query.offset)
  }

  if (!query.limit) {
    query.limit = query.itemsPerPage
  } else {
    query.limit = Number(query.limit)
  }

  if (query.page) {
    query.page = query.page ? Number(query.page) : 1
    query.limit = query.itemsPerPage
    query.offset = Math.max(0, (query.page - 1) * query.itemsPerPage)
  }

  return query
}
