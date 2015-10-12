import crypto from 'crypto'
import moment from 'moment'
import collection from '../collection'
import created from '../plugins/created'
import modified from '../plugins/modified'

export const ACCESS_TOKEN_TTL = 3600
export const REFRESH_TOKEN_TTL = 604800
export const TOKEN_TYPE_ACCESS = 'access_token'
export const TOKEN_TYPE_REFRESH = 'refresh_token'

const Token = collection({
  identity: 'token',
  connection: 'default',
  autoCreatedAt: false,
  autoUpdatedAt: false,
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

Token.plugin(created)
Token.plugin(modified)

export default Token
