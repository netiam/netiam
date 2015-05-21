import _ from 'lodash'

function request() {
  return function() {
    throw new Error('rest.map.req is not implemented')
  }
}

function response(map) {

  function mapDocument(document) {
    const doc = {}

    if (_.isFunction(document.toObject)) {
      document = document.toObject()
    }

    _.forEach(document, function(val, key) {
      key = map[key] || key
      doc[key] = val
    })

    return doc
  }

  return function(req, res) {
    if (_.isArray(res.body)) {
      res.body = _.map(res.body, mapDocument)
      return
    }

    if (_.isObject(res.body)) {
      res.body = mapDocument(res.body)
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
