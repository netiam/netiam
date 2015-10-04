import collection from '../../src/db/collection'
import created from '../../src/db/plugins/created'
import merge from '../../src/db/plugins/merge'
import modified from '../../src/db/plugins/modified'

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
Node.plugin(merge)
Node.plugin(modified)

export default Node
