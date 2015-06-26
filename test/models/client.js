import mongoose, {Schema} from 'mongoose'

const schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  secret: {
    type: String,
    required: true
  }
})

export default mongoose.model('Client', schema)
