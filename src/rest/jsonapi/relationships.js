import _ from 'lodash'
import id from './id'
import links from './links'

export default function relationships(spec) {
  return _.reduce(
    _.pick(spec.data, spec.refs), (_relationships, relationship, key) => {
      _relationships[key] = {
        data: {
          id: id({
            data: relationship,
            idField: spec.idField
          }),
          type: _.camelCase(spec.collection.schema.paths[key].options.ref),
          links: links({
            req: spec.req,
            type: _.camelCase(spec.collection.schema.paths[key].options.ref),
            isRelated: true
          })
        }
      }
      return _relationships
    }, {}
  )
}
