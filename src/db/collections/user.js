import uuid from 'uuid'
import collection from '../collection'
import auth from './../plugins/auth'
import created from './../plugins/created'
import modified from './../plugins/modified'

const User = collection({
  identity: 'user',
  connection: 'default',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      unique: true,
      required: true
    },
    description: {
      type: 'string'
    },
    role: {
      model: 'Role'
    }
  }
})

User.plugin(auth)
User.plugin(created)
User.plugin(modified)

export default User
