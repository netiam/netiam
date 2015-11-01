import mongoose, {Schema} from 'mongoose'
import validator from 'validator'
import plugins from '../../src/rest/schema/plugins'

const User = new Schema({
  name: String,
  description: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
    validate: [validator.isEmail, 'invalid email']
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  password: String,
  firstname: String,
  lastname: String,
  location: {
    type: [Number],
    index: '2dsphere'
  }
})

User.plugin(plugins.auth)
User.plugin(plugins.created)
User.plugin(plugins.merge)
User.plugin(plugins.modified)

export default mongoose.model('User', User)
