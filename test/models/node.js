import mongoose, {Schema} from 'mongoose'
import plugins from '../../src/rest/schema/plugins'

const Node = new Schema({
  name: String,
  edges: Object
})

Node.plugin(plugins.merge)

export default mongoose.model('Node', Node)
