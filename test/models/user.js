import mongoose from 'mongoose'
import restPlugin from '../../lib/rest/model'
let Schema = mongoose.Schema

// Define user schema
let schema = new Schema({
  name: String,
  description: String,
  email: {
    type: String,
    unique: true,
    sparse: true
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

// Create model class and export
export default mongoose.model('User', schema)
