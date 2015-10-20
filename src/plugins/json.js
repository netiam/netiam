import _ from 'lodash'
import {
  getCollectionByIdentity
} from '../db'

export default function json(spec = {}) {
  let type
  const {collection} = spec
  if (collection) {
    type = _.camelCase(collection.prototype.identity)
  }

  return function(req, res) {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    if (type) {
      return res.json({
        [type]: res.body
      })
    }

    res.json(res.body)
  }

}
