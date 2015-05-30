import _ from 'lodash'
import url from 'url'

export default function(spec) {
  const {collection} = spec
  let {itemsPerPage} = spec

  itemsPerPage = itemsPerPage || 10

  async function links(req, res) {
    const cnt = await collection.count()
    const base = req.protocol + '://' + req.get('host')
    const self = url.parse(base + req.originalUrl, true)
    const page = req.query.page || 1

    self.search = undefined
    self.query.page = page
    const o = {self: url.format(self)}

    if (_.isArray(res.body)) {
      const next = url.parse(base + req.originalUrl, true)
      next.search = undefined
      next.query.page = page + 1

      const last = url.parse(base + req.originalUrl, true)
      last.search = undefined
      last.query.page = Math.max(1, Math.ceil(cnt / itemsPerPage))

      if (url.format(next) < url.format(last)) {
        o.next = url.format(next)
      }

      if (url.format(last) !== o.self) {
        o.last = url.format(last)
      }
    }

    return o
  }

  async function struct(req, res) {
    const o = {}
    const l = await links(req, res)

    if (!_.isEmpty(l)) {
      o.links = l
    }

    o.data = res.body

    return o
  }

  return async function(req, res) {
    const structure = await struct(req, res)

    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    return res
      .type('application/vnd.api+json')
      .json(structure)
  }

}
