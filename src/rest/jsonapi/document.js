import _ from 'lodash'
import attributes from './attributes'
import id from './id'
import links from './links'
import relationships from './relationships'

export default function document(spec) {
  const doc = {
    id: id({
      data: spec.data,
      idField: spec.idField
    }),
    type: _.camelCase(spec.type),
    attributes: _.omit(attributes({
      data: spec.data,
      refs: spec.refs
    }), [spec.idField])
  }

  if (spec.isReference) {
    doc.links = links({
      req: spec.req,
      related: spec.isReference
    })
  }

  if (_.isArray(spec.refs)) {
    doc.relationships = relationships({
      collection: spec.collection,
      req: spec.req,
      data: spec.data,
      refs: spec.refs
    })
  }

  return doc
}
