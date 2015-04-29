import resource from '../rest/resource'

export default function rest(opts) {
  let {idParam} = opts
  let restResource = resource(opts)

  idParam = idParam || 'id'

  return function(req, res) {
    const method = req.method

    if (method === 'GET' && !req.params[idParam]) {
      return restResource
        .list(req, res)
        .then(function(documents) {
          res.body = documents
          res.status(200)
        })
    }

    if (method === 'POST') {
      return restResource
        .create(req, res)
        .then(function(document) {
          res.body = document
          res.status(201)
        })
    }

    if (method === 'GET') {
      return restResource
        .read(req, res)
        .then(function(document) {
          res.body = document
          res.status(200)
        })
    }

    if (method === 'PUT') {
      return restResource
        .update(req, res)
        .then(function(document) {
          res.body = document
          res.status(200)
        })
    }

    if (method === 'DELETE') {
      return restResource
        .remove(req, res)
        .then(function(document) {
          res.body = document
          res.status(204)
        })
    }
  }
}
