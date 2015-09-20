import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

const Role = collection({
  identity: 'role',
  connection: 'default',
  attributes: {
    name: {
      type: 'string',
      unique: true,
      primaryKey: true,
      required: true,
      minLength: 1,
      maxLength: 255
    },
    parent: {
      model: 'Role'
    },
    superuser: {
      type: 'boolean',
      defaultsTo: false
    },
    description: {
      type: 'string',
      maxLength: 140
    }
  }
})

Role.plugin(created)
Role.plugin(modified)

export default Role
