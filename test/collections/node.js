import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

const Node = collection({
  identity: 'node',
  connection: 'default',
  attributes: {
    name: {
      type: 'string'
    },
    edges: {
      type: 'json'
    }
  }
})

Node.plugin(created)
Node.plugin(modified)
Node.plugin(merge)

export default Node
