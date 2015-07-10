import {Schema} from 'mongoose'
import crypto from 'crypto'

export const ACCESS_TOKEN_TTL = 3600
export const REFRESH_TOKEN_TTL = 604800
export const TOKEN_TYPE_ACCESS = 'access_token'
export const TOKEN_TYPE_REFRESH = 'refresh_token'

const Token = new Schema({
  token: {
    type: String,
    default: function() {
      return crypto.randomBytes(64).toString('hex')
    },
    required: true
  },
  token_type: {
    type: String,
    default: TOKEN_TYPE_ACCESS,
    enum: [TOKEN_TYPE_ACCESS, TOKEN_TYPE_REFRESH],
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  expires_at: {
    type: Date,
    default: function() {
      const now = new Date()
      return new Date(now.getTime() + ACCESS_TOKEN_TTL * 1000)
    },
    expires: REFRESH_TOKEN_TTL,
    required: true
  }
})

export default Token
