import collection from '../collection'
import crypto from 'crypto'
import moment from 'moment'

export const ACCESS_TOKEN_TTL = 3600
export const REFRESH_TOKEN_TTL = 604800
export const TOKEN_TYPE_ACCESS = 'access_token'
export const TOKEN_TYPE_REFRESH = 'refresh_token'

export default collection({
  identity: 'token',
  connection: 'default',
  attributes: {
    token: {
      type: 'string',
      required: true,
      primaryKey: true,
      defaultsTo: function() {
        return crypto.randomBytes(64).toString('hex')
      }
    },
    token_type: {
      type: 'string',
      defaultsTo: TOKEN_TYPE_ACCESS,
      enum: [TOKEN_TYPE_ACCESS, TOKEN_TYPE_REFRESH],
      required: true
    },
    owner: {
      model: 'user',
      required: true
    },
    client: {
      model: 'client'
    },
    expires_at: {
      type: 'datetime',
      required: true,
      defaultsTo: function() {
        return moment().add(ACCESS_TOKEN_TTL, 's').toDate()
      }
    }
  }
})
