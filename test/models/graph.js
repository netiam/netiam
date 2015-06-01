import mongoose, {Schema} from 'mongoose'
import {
  created,
  merge,
  modified
  } from '../../src/rest/schema/plugins'

const schema = new Schema({
  nodes: [Object]
})

schema.plugin(created)
schema.plugin(merge)
schema.plugin(modified)

export default mongoose.model('Graph', schema)
