import collection from '../../src/db/collection'
import created from '../../src/db/plugins/created'
import merge from '../../src/db/plugins/merge'
import modified from '../../src/db/plugins/modified'

const Graph = collection({
  identity: 'graph',
  connection: 'default',
  attributes: {
    nodes: {
      collection: 'node',
      via: 'graph'
    }
  }
})

Graph.plugin(created)
Graph.plugin(merge)
Graph.plugin(modified)

export default Graph
