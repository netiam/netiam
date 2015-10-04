import collection from '../../src/db/collection'
import created from '../../src/db/plugins/created'
import merge from '../../src/db/plugins/merge'
import modified from '../../src/db/plugins/modified'

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
Project.plugin(merge)
Project.plugin(modified)

export default Project
