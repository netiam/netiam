import _ from 'lodash'
import {Schema} from 'mongoose'
import errors from 'netiam-errors'
import url from 'url'
import resource,{normalize, params, ONE_TO_MANY, MANY_TO_ONE} from '../rest/resource'
import filter from '../rest/odata/filter'

function dbrefs(collection) {
  const schema = collection.schema
  let refs = []

  _.forEach(schema.paths, (path, name) => {
    let caster = path.caster
    let opt = path.options

    if (caster && caster.options && caster.options.ref) {
      refs.push(name)
    } else if (opt && opt.ref) {
      refs.push(name)
    }
  })

  return refs
}

function request() {
  throw errors.notImplemnted('jsonapi#request is not implemented')
}

function response(spec) {
  const {collection} = spec
  const {relationshipField} = spec
  const {relationshipCollection} = spec
  const {map} = spec
  let {idField} = spec
  let {relationship} = spec
  let {itemsPerPage} = spec

  idField = idField || '_id'
  relationship = relationship || ONE_TO_MANY
  itemsPerPage = itemsPerPage || 1

  const refs = dbrefs(collection)

  function count(req, query) {
    return new Promise((resolve, reject) => {

      // filter
      let f = filter(query.filter)

      // handle relationships
      if (relationship === MANY_TO_ONE &&
        relationshipField &&
        relationshipCollection &&
        map) {

        const key = Object.keys(map)[0]
        const val = req.params[map[key].substr(1)]

        collection
          .findOne({[key]: val})
          .select(relationshipField)
          .exec((err, doc) => {
            if (err) {
              debug(err)
              return reject(err)
            }

            if (!doc) {
              return resolve([])
            }

            // query
            let q
            try {
              q = relationshipCollection.count(f.toObject())
            } catch (err) {
              debug(err)
              reject(errors.badRequest(err.message))
            }

            // select only related
            q = q.where('_id').in(doc[relationshipField])

            // execute
            q.exec((err, cnt) => {
              if (err) {
                debug(err)
                return reject(errors.internalServerError(err.message))
              }

              resolve(cnt)
            })
          })

        return
      }

      if (relationship === ONE_TO_MANY) {
        f = f.where(params(req.params))

        // query
        let q
        try {
          q = collection.count(f.toObject())
        } catch (err) {
          debug(err)
          reject(errors.badRequest(err.message))
        }

        // execute
        q.exec((err, cnt) => {
          if (err) {
            debug(err)
            return reject(errors.internalServerError(err.message))
          }

          resolve(cnt)
        })
      }
    })
  }

  function id(body) {
    if (body.constructor.name === 'ObjectID') {
      return body.toString()
    }

    if (body && body[idField]) {
      return typeof body[idField] === String
        ? body[idField]
        : body[idField].toString()
    }

    if (body && body.id) {
      return typeof body.id === String
        ? body.id
        : body.id.toString()
    }

    if (body && body._id) {
      return typeof body._id === String
        ? body._id
        : body._id.toString()
    }
  }

  function attributes(body, refs = []) {
    return _.omit(body, refs)
  }

  function relationships(body, refs) {
    return _.reduce(_.pick(body, refs), function(rels, relationship, key) {
      rels[key] = {
        data: {
          id: id(relationship),
          type: _.camelCase(collection.schema.paths[key].options.ref)
        }
      }
      return rels
    }, {})
  }

  function links(req, body, cnt) {
    const base = req.protocol + '://' + req.get('host')
    const self = url.parse(base + req.originalUrl, true)
    const page = Number(req.query.page) || 1

    self.search = undefined
    self.query.page = page

    const _links = {self: url.format(self)}

    if (_.isArray(body)) {
      const first = url.parse(base + req.originalUrl, true)
      first.search = undefined
      first.query.page = 1

      const next = url.parse(base + req.originalUrl, true)
      next.search = undefined
      next.query.page = page + 1

      const prev = url.parse(base + req.originalUrl, true)
      prev.search = undefined
      prev.query.page = page - 1

      const last = url.parse(base + req.originalUrl, true)
      last.search = undefined
      last.query.page = Math.max(1, Math.ceil(cnt / itemsPerPage))

      if (first.query.page < self.query.page) {
        _links.first = url.format(first)
      }

      if (prev.query.page > first.query.page && prev.query.page < self.query.page) {
        _links.prev = url.format(prev)
      }

      if (next.query.page < last.query.page) {
        _links.next = url.format(next)
      }

      if (last.query.page > self.query.page) {
        _links.last = url.format(last)
      }

      return _links
    }

    return _links
  }

  function data(body, type) {
    if (_.isArray(body)) {
      return _.map(body, node => {
        return {
          id: id(node),
          type: _.camelCase(type),
          attributes: _.omit(attributes(node, refs), ['id', '_id']),
          relationships: relationships(node, refs)
        }
      })

    }

    if (_.isObject(body)) {
      return {
        id: id(body),
        type: _.camelCase(type),
        attributes: _.omit(attributes(body, refs), ['id', '_id']),
        relationships: relationships(body, refs)
      }
    }

    throw errors.internalServerError('Cannot process resonse body')
  }

  function included(body, query, refs) {
    refs = _.intersection(query.expand, refs)

    const list = _.reduce(refs, (results, ref) => {
      if (_.isArray(body)) {
        _.forEach(body, node => {
          if (_.isArray(node[ref])) {
            results = results.concat(_.map(node[ref], result => {
              return {
                id: id(result),
                type: _.camelCase(collection.schema.paths[ref].options.ref),
                attributes: _.omit(attributes(result), ['id', '_id'])
              }
            }))
          } else if (_.isObject(node[ref])) {
            results.push({
              id: id(node[ref]),
              type: _.camelCase(collection.schema.paths[ref].options.ref),
              attributes: _.omit(attributes(node[ref]), ['id', '_id'])
            })
          }
          return results
        })
      }

      if (_.isObject(body)) {
        if (_.isArray(body[ref])) {
          results = results.concat(_.map(body[ref], result => {
            return {
              id: id(result),
              type: _.camelCase(collection.schema.paths[ref].options.ref),
              attributes: _.omit(attributes(result), ['id', '_id'])
            }
          }))
        } else if (_.isObject(body[ref])) {
          results.push({
            id: id(body[ref]),
            type: _.camelCase(collection.schema.paths[ref].options.ref),
            attributes: _.omit(attributes(body[ref]), ['id', '_id'])
          })
        }
        return results
      }

    }, [])

    return _.uniq(list, idField)
  }

  return (req, res) => {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    return new Promise((resolve, reject) => {
      const query = normalize(req.query, idField)

      count(req, query)
        .then(cnt => {
          res.json({
            links: links(req, res.body, cnt),
            data: data(res.body, collection.modelName),
            included: included(res.body, query, refs)
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

}

export default Object.freeze({
  req: request,
  res: response
})
