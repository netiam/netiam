import _ from 'lodash'

function request(map, spec = {}) {
  const {expand} = spec

  function mapFields(document, map, expand) {
    const doc = {}

    _.forEach(document, function(val, key) {
      key = map[key] || key
      doc[key] = val
    })

    // expand
    _.forEach(expand, function(map, path) {
      if (_.isArray(doc[path])) {
        doc[path] = _.map(doc[path], function(document) {
          return mapFields(document, map)
        })
        return
      }

      if (_.isObject(doc[path])) {
        doc[path] = mapFields(doc[path], map)
      }
    })

    return doc
  }

  return function(req) {
    let queryExpand
    // property expansion
    if (_.isString(req.query.expand)) {
      queryExpand = req.query.expand.split(',')
    }
    let expandedPaths = _.pick(expand, queryExpand)

    if (_.isArray(req.body)) {
      req.body = _.map(req.body, function(document) {
        return mapFields(document, map, expandedPaths)
      })
      return
    }

    if (_.isObject(req.body)) {
      req.body = mapFields(req.body, map, expandedPaths)
    }
  }
}

function response(map, spec = {}) {
  const {expand} = spec

  function mapFields(document, map, expand) {
    const doc = {}

    if (_.isFunction(document.toObject)) {
      document = document.toObject()
    }

    _.forEach(document, function(val, key) {
      key = map[key] || key
      doc[key] = val
    })

    // expand
    _.forEach(expand, function(map, path) {
      if (_.isArray(doc[path])) {
        doc[path] = _.map(doc[path], function(document) {
          return mapFields(document, map)
        })
        return
      }

      if (_.isObject(doc[path])) {
        doc[path] = mapFields(doc[path], map)
      }
    })

    return doc
  }

  return function(req, res) {
    let queryExpand
    // property expansion
    if (_.isString(req.query.expand)) {
      queryExpand = req.query.expand.split(',')
    }
    let expandedPaths = _.pick(expand, queryExpand)

    if (_.isArray(res.body)) {
      res.body = _.map(res.body, function(document) {
        return mapFields(document, map, expandedPaths)
      })
      return
    }

    if (_.isObject(res.body)) {
      res.body = mapFields(res.body, map, expandedPaths)
    }
  }

}

export default Object.freeze({
  req: request,
  res: response
})
