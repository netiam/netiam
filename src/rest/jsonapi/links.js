import _ from 'lodash'
import url from 'url'

export default function links(spec) {
  const base = spec.req.protocol + '://' + spec.req.get('host')
  let self = url.parse(base + spec.req.originalUrl, true)
  const page = Number(spec.req.query.page) || 1

  self.search = undefined
  self.query.page = page

  const _links = {self: url.format(self)}

  if (spec.res && _.isArray(spec.res.body)) {
    const first = url.parse(base + spec.req.originalUrl, true)
    first.search = undefined
    first.query.page = 1

    const next = url.parse(base + spec.req.originalUrl, true)
    next.search = undefined
    next.query.page = page + 1

    const prev = url.parse(base + spec.req.originalUrl, true)
    prev.search = undefined
    prev.query.page = page - 1

    const last = url.parse(base + spec.req.originalUrl, true)
    last.search = undefined
    last.query.page = Math.max(1, Math.ceil(spec.count / spec.itemsPerPage))

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

  if (spec.isRelated) {
    self = url.parse(base + spec.req.originalUrl, true)
    self.pathname += '/relationships/' + spec.type
    _links.self = url.format(self)

    const related = url.parse(base + spec.req.originalUrl, true)
    related.pathname += '/' + spec.type
    _links.related = url.format(related)
  }

  return _links
}
