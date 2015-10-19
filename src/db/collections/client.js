import uuid from 'uuid'
import crypto from 'crypto'
import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

const Client = collection({
  identity: 'client',
  connection: 'default',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    key: {
      type: 'string',
      unique: true,
      required: true,
      primaryKey: true,
      defaultsTo: uuid.v4
    },
    secret: {
      type: 'string',
      required: true,
      defaultsTo: function() {
        return crypto.randomBytes(64).toString('hex')
      }
    }
  }
})

Client.plugin(created)
Client.plugin(modified)

export default Client
