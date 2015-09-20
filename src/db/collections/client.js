import uuid from 'uuid'
import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

const Client = collection({
  identity: 'client',
  connection: 'default',
  attributes: {
    email: {
      type: 'string',
      unique: true,
      primaryKey: true,
      required: true,
      uuidv4: true,
      defaultsTo: uuid.v4
    },
    role: {
      model: 'Role'
    }
  }
})

Client.plugin(created)
Client.plugin(modified)

export default Client
