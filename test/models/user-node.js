import mongoose, {Schema} from 'mongoose'
import {merge} from '../../src/rest/schema/plugins'

const schema = new Schema({
  score: Number,
  node: {
    type: Schema.Types.ObjectId,
    ref: 'Node'
  }
})

schema.plugin(merge)

export default mongoose.model('UserNode', schema)
