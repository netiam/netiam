import _ from 'lodash'
import errors from 'netiam-errors'
import dbrefs from './jsonapi/dbrefs'
import document from './jsonapi/document'
import included from './jsonapi/included'
import links from './jsonapi/links'

function data(spec) {
  if (_.isArray(spec.body)) {
    return _.map(spec.body, node => {
      return document({
        req: spec.req,
        res: spec.res,
        collection: spec.collection,
        data: node,
        type: spec.type,
        refs: spec.refs
      })
    })
  }

  if (_.isObject(spec.body)) {
    return document({
      req: spec.req,
      res: spec.res,
      collection: spec.collection,
      data: spec.body,
      type: spec.type,
      refs: spec.refs
    })
  }

  throw errors.internalServerError('Cannot process resonse body')
}

function transform(spec) {

  const refs = dbrefs(spec.collection)

  return {
    links: links({
      req: spec.req,
      res: spec.res,
      count: spec.count,
      itemsPerPage: spec.itemsPerPage
    }),
    data: data({
      req: spec.req,
      res: spec.res,
      body: spec.res.body,
      collection: spec.collection,
      type: spec.collection.modelName,
      refs
    }),
    included: included({
      req: spec.req,
      res: spec.res,
      collection: spec.collection,
      refs: refs,
      idField: spec.idField
    })
  }
}

export default Object.freeze({
  transform
})
