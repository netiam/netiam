import collection from '../collection'
import created from './../plugins/created'
import modified from './../plugins/modified'

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
Graph.plugin(modified)
Graph.plugin(merge)

export default Graph
