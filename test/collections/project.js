import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

const Project = collection({
  identity: 'project',
  connection: 'default',
  attributes: {
    name: 'string',
    owner: {
      collection: 'user'
    },
    users: {
      collection: 'user',
      via: 'id'
    }
  }
})

Project.plugin(created)
Project.plugin(modified)
Project.plugin(merge)

export default Project
