import collection from '../collection'
import auth from './../plugins/auth'
import created from './../plugins/created'
import modified from './../plugins/modified'

const User = collection({
  identity: 'user',
  connection: 'default',
  attributes: {
    email: {
      type: 'string',
      unique: true,
      primaryKey: true,
      required: true
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
