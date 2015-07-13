import mongoose, {Schema} from 'mongoose'
import {
  acl,
  created,
  merge,
  modified
  } from '../../src/rest/schema/plugins'

const schema = new Schema({
  name: String,
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

schema.plugin(acl, {settings: require('../fixtures/project.acl.json')})
schema.plugin(created)
schema.plugin(merge)
schema.plugin(modified)

export default mongoose.model('Project', schema)
