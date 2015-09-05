import _ from 'lodash'
import dbg from 'debug'
import async from 'async'
import {params, normalize} from './query'
import {ONE_TO_MANY, MANY_TO_ONE} from './relationships'
import filter from './odata/filter'
import * as errors from 'netiam-errors'
import list from './methods/list'
import create from './methods/create'
import read from './methods/read'
import update from './methods/update'
import remove from './methods/remove'

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
 *      relationship: hasMany(Project, {field: 'projects', param: 'user'})
 *    })
 * )
 * ```
 *
 * @param {Object} Model
 * @param {Object} spec
 * @returns {Object}
 */
export function hasMany(Model, spec) {
  if (!Model) {
    throw errors.internalServerError(
      'A "hasMany" relationship must must define a target "Model"')
  }

  if (!spec.field) {
    throw errors.internalServerError(
      'A "hasMany" relationship must define option "field"')
  }

  return Object.assign({
    idField: '_id',
    type: ONE_TO_MANY,
    Model: Model
  }, spec)
}

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
 * @param {Object} Model
 * @param {Object} spec
 * @returns {Object}
 */
export function belongsTo(Model, spec) {
  if (!Model) {
    throw errors.internalServerError(
      'A "belongsTo" relationship must must define a base "Model"')
  }

  if (!spec.field) {
    throw errors.internalServerError(
      'A "belongsTo" relationship must define option "field"')
  }

  return Object.assign({
    idField: '_id',
    type: MANY_TO_ONE,
    Model: Model
  }, spec)
}

export default function resource(spec) {
  spec.idParam = spec.idParam || 'id'
  spec.idField = spec.idField || '_id'

  return Object.freeze({
    list: (req) => list(Object.assign({req}, spec)),
    create: (req) => create(Object.assign({req}, spec)),
    read: (req) => read(Object.assign({req}, spec)),
    update: (req) => update(Object.assign({req}, spec)),
    remove: (req) => remove(Object.assign({req}, spec))
  })
}
