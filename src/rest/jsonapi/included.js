import _ from 'lodash'
import document from './document'
import {normalize} from '../query'

export default function included(spec) {
  const query = normalize({
    req: spec.req,
    idField: spec.idField
  })
  const refs = _.intersection(query.expand, spec.refs)
  const data = spec.res.body

  if (!refs || !refs.length) {
    return
  }

  function list(arr, ref) {
    return _.map(arr, result => {
      return document({
        req: spec.req,
        data: result,
        type: spec.collection.definition[ref].model,
        idField: spec.idField
      })
    })
  }

  return _.uniq(
    _.reduce(refs, (results, ref) => {
        if (_.isArray(data)) {
          _.forEach(data, node => {
            if (_.isArray(node[ref])) {
              results = results.concat(list(node[ref], ref))
            } else if (_.isObject(node[ref])) {
              results.push(document({
                req: spec.req,
                data: node[ref],
                type: spec.collection.definition[ref].model
              }))
            }
          })
        }

        if (_.isObject(data)) {
          if (_.isArray(data[ref])) {
            results = results.concat(list(data[ref], ref))
          } else if (_.isObject(data[ref])) {
            results.push(document({
              req: spec.req,
              data: data[ref],
              type: spec.collection.definition[ref].model
            }))
          }
        }

        return results
      }, []
    ),
    spec.idField)
}
