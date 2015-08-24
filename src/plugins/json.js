import _ from 'lodash'

export default function json(spec) {
  let type

  if (spec && spec.collection && spec.collection.modelName) {
    type = _.camelCase(spec.collection.modelName)
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
