# Models

```js
import mongoose, {Schema} from 'mongoose'
import restPlugin from '../../src/rest/model'

// Define user schema
const schema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  password: String
})

// Apply plugin(s)
schema.plugin(restPlugin, {})

// Create model class and export
export default mongoose.model('User', schema)
```
