import {Schema} from 'mongoose'

export default new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  superuser: Boolean,
  description: String
})
