import _ from 'lodash'

export default function graph(opts) {
  let {nodesField} = opts

  nodesField = nodesField || 'nodes'

  return function(req, res) {
    if (!res.body) {
      return
    }

    const document = res.body

    if (!_.isArray(document[nodesField])) {
      throw new Error(nodesField + ' is not an Array')
    }

    const map = {}
    const graph = {
      nodes: [],
      edges: []
    }

    document[nodesField].forEach(function(node, index) {
      graph.nodes.push(node)
      map[node._id] = index
    })

    document[nodesField].forEach(function(node) {
      if (_.isObject(node.edges)) {
        _.forEach(node.edges, function(edge) {
          graph.edges.push({
            source: map[node._id],
            target: map[edge]
          })
        })
      }
    })

    res.body = graph
  }

}
