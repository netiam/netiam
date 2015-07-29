import dbg from 'debug'
import * as errors from 'netiam-errors'

const debug = dbg('netiam:plugins:client')

const API_CLIENT_ID = 'Api-Client-Id'

export default function(spec) {
  const {collection} = spec
  let {idField} = spec

  idField = idField || 'key'

  return function(req, res) {
    return new Promise((resolve, reject) => {
      const clientId = req.get(API_CLIENT_ID)

      collection
        .findOne({
          [idField]: clientId
        })
        .exec(function(err, document) {
          if (err) {
            debug(err)
            return reject(errors.internalServerError(err.message))
          }

          if (!document) {
            return reject(errors.forbidden('You must provide a valid "api-client-id". Please verify that you have set the header value accordingly.'))
          }

          // set id for response header
          res.set(API_CLIENT_ID, document.key)

          resolve()
        })
    })
  }

}
