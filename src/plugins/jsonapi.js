import _ from 'lodash'
import url from 'url'

export default function jsonapi(spec) {
  let {collection} = spec
  let {itemsPerPage} = spec

  itemsPerPage = itemsPerPage || 10

  function links(req, res) {
    return new Promise((resolve, reject) => {
      collection.count(function(err, cnt) {
        if (err) {
          return reject(err)
        }

        const base = req.protocol + '://' + req.get('host')
        const self = url.parse(base + req.originalUrl, true)
        const page = req.query.page || 1

        self.search = undefined
        self.query.page = page
        const o = {
          self: url.format(self)
        }

        if (_.isArray(res.body)) {
          let next = url.parse(base + req.originalUrl, true)
          next.search = undefined
          next.query.page = page + 1

          let last = url.parse(base + req.originalUrl, true)
          last.search = undefined
          last.query.page = Math.max(1, Math.ceil(cnt / itemsPerPage))

          if (url.format(next) < url.format(last)) {
            o.next = url.format(next)
          }

          if (url.format(last) !== o.self) {
            o.last = url.format(last)
          }
        }

        resolve(o)
      })
    })
  }

  function struct(req, res) {
    const o = {}

    return links(req, res)
      .then(function(l) {
        if (!_.isEmpty(l)) {
          o.links = l
        }

        o.data = res.body

        return o
      })
  }

  return function(req, res) {
    return struct(req, res)
      .then(function(structure) {
        if (!res.body) {
          res
            .status(204)
            .end()
          return
        }

        res
          .type('application/vnd.api+json')
          .json(structure)
      })
  }

}
