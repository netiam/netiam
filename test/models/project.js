import mongoose, {Schema} from 'mongoose'
import plugins from '../../src/rest/schema/plugins'

const Project = new Schema({
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

Project.plugin(plugins.created)
Project.plugin(plugins.merge)
Project.plugin(plugins.modified)

export default mongoose.model('Project', Project)
