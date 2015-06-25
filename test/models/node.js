import mongoose, {Schema} from 'mongoose'
import {merge} from '../../src/rest/schema/plugins'

const schema = new Schema({
  name: String,
  edges: Object
})

schema.plugin(merge)

export default mongoose.model('Node', schema)
