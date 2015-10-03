import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

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
UserNode.plugin(modified)
UserNode.plugin(merge)

export default UserNode
