import collection from '../../src/db/collection'
import created from '../../src/db/plugins/created'
import merge from '../../src/db/plugins/merge'
import modified from '../../src/db/plugins/modified'

const UserNode = collection({
  identity: 'usernode',
  connection: 'default',
  attributes: {
    score: 'float',
    node: {
      collection: 'node'
    }
  }
})

UserNode.plugin(created)
UserNode.plugin(merge)
UserNode.plugin(modified)

export default UserNode
