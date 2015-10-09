import _ from 'lodash'
import url from 'url'

export default function(spec) {
  const {collection} = spec
  const {itemsPerPage} = spec

  async function links(req, res) {
    const cnt = await collection.count()
    const base = req.protocol + '://' + req.get('host')
    const self = url.parse(base + req.originalUrl, true)
    const page = Number(req.query.page || 1)
    const limit = req.query.itemsPerPage
      ? Number(req.query.itemsPerPage)
      : itemsPerPage

    self.search = undefined
    self.query.page = page
    const o = {self: url.format(self)}

    if (_.isArray(res.body)) {
      const first = url.parse(base + req.originalUrl, true)
      first.search = undefined
      first.query.page = 1

      const prev = url.parse(base + req.originalUrl, true)
      prev.search = undefined
      prev.query.page = page - 1

      const next = url.parse(base + req.originalUrl, true)
      next.search = undefined
      next.query.page = page + 1

      const last = url.parse(base + req.originalUrl, true)
      last.search = undefined
      last.query.page = Math.max(1, Math.ceil(cnt / limit))

      if (first.query.page < self.query.page) {
        o.first = url.format(first)
      }

      if (prev.query.page > first.query.page && prev.query.page < self.query.page) {
        o.prev = url.format(prev)
      }

      if (next.query.page < last.query.page && next.query.page > self.query.page) {
        o.next = url.format(next)
      }

      if (last.query.page > self.query.page) {
        o.last = url.format(last)
      }
    }

    return o
  }

  async function meta(req, res) {
    const size = await collection.count()
    return {size}
  }

  async function struct(req, res) {
    const o = {}
    const l = await links(req, res)
    const m = await meta(req, res)

    if (!_.isEmpty(l)) {
      o.links = l
    }

    if (!_.isEmpty(m)) {
      o.meta = m
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
