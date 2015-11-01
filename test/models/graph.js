import mongoose, {Schema} from 'mongoose'
import plugins from '../../src/rest/schema/plugins'

const Graph = new Schema({
  nodes: [Object]
})

Graph.plugin(plugins.created)
Graph.plugin(plugins.merge)
Graph.plugin(plugins.modified)

export default mongoose.model('Graph', Graph)
