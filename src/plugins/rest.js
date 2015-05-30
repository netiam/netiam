import resource from '../rest/resource'

export default function rest(opts) {
  const restResource = resource(opts)
  let {idParam} = opts

  idParam = idParam || 'id'

  return async function(req, res) {
    const method = req.method

    if (method === 'GET' && !req.params[idParam]) {
      res.body = await restResource.list(req, res)
      return res.status(200)
    }

    if (method === 'POST') {
      res.body = await restResource.create(req, res)
      return res.status(201)
    }

    if (method === 'GET') {
      res.body = await restResource.read(req, res)
      return res.status(200)
    }

    if (method === 'PUT') {
      res.body = await restResource.update(req, res)
      return res.status(200)
    }

    if (method === 'DELETE') {
      res.body = await restResource.remove(req, res)
      return res.status(204)
    }
  }
}
