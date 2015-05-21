import mongoose, {Schema} from 'mongoose'
import restPlugin from '../../src/rest/model'
import authPlugin from '../../src/rest/schema/plugins/auth'

// Define user schema
let schema = new Schema({
  name: String,
  description: String,
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  password: String,
  firstname: String,
  lastname: String,
  location: {
    type: [Number],
    index: '2dsphere'
  }
})

// Apply plugin(s)
schema.plugin(restPlugin, {})
schema.plugin(authPlugin, {})

// Create model class and export
export default mongoose.model('User', schema)
