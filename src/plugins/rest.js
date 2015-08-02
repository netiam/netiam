import resourceRest from '../rest/resource'

export default function rest(spec) {
  const resource = resourceRest(spec)
  let {idParam} = spec

  idParam = idParam || 'id'

  return async function(req, res) {
    const method = req.method

    if (method === 'GET' && !req.params[idParam]) {
      res.body = await resource.list(req, res)
      return res.status(200)
    }

    if (method === 'POST') {
      res.body = await resource.create(req, res)
      return res.status(201)
    }

    if (method === 'GET') {
      res.body = await resource.read(req, res)
      return res.status(200)
    }

    if (method === 'PUT') {
      res.body = await resource.update(req, res)
      return res.status(200)
    }

    if (method === 'DELETE') {
      res.body = await resource.remove(req, res)
      return res.status(204)
    }
  }
}
