import dbg from 'debug'
import {
  BadRequest,
  InternalServerError,
  Forbidden,
  Codes
} from 'netiam-errors'

const debug = dbg('netiam:plugins:client')

const API_CLIENT_ID = 'Api-Client-Id'

export default function(spec) {
  const {collection} = spec
  const {idField = 'key'} = spec

  return function(req, res) {
    return new Promise((resolve, reject) => {
      const clientId = req.get(API_CLIENT_ID)

      if (!clientId) {
        return reject(
          new BadRequest(
            Codes.E1000, 'You must provide a "api-client-id" header.'))
      }

      collection
        .findOne({
          [idField]: clientId
        })
        .exec(function(err, document) {
          if (err) {
            debug(err)
            return reject(new InternalServerError(Codes.E1000, err.message))
          }

          if (!document) {
            return reject(
              new Forbidden(
                Codes.E1000, 'You must provide a valid "api-client-id". Please verify that you have set the header value accordingly.'))
          }

          // set id for response header
          res.set(API_CLIENT_ID, document.key)

          resolve()
        })
    })
  }

}
