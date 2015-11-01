import mongoose, {Schema} from 'mongoose'
import plugins from '../../src/rest/schema/plugins'

const UserNode = new Schema({
  score: Number,
  node: {
    type: Schema.Types.ObjectId,
    ref: 'Node'
  }
})

UserNode.plugin(plugins.merge)

export default mongoose.model('UserNode', UserNode)
