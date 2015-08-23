import _ from 'lodash'
import url from 'url'

export default function links({req, res, count, related = false, itemsPerPage = 10}) {
  const base = req.protocol + '://' + req.get('host')
  const self = url.parse(base + req.originalUrl, true)
  const page = Number(req.query.page) || 1

  self.search = undefined
  self.query.page = page

  const _links = {self: url.format(self)}

  if (_.isArray(res.body)) {
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
    last.query.page = Math.max(1, Math.ceil(count / itemsPerPage))

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

  if (related) {
    const related = url.parse(base + req.originalUrl, true)
    related.search = undefined
    // TODO
  }

  return _links
}
