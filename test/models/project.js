import mongoose, {Schema} from 'mongoose'
import {
  created,
  merge,
  modified
} from '../../src/rest/schema/plugins'

const schema = new Schema({
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

schema.plugin(created)
schema.plugin(merge)
schema.plugin(modified)

export default mongoose.model('Project', schema)
