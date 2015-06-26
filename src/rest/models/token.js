import mongoose from 'mongoose'
import schema from '../schema/oauth/token'

const Token = mongoose.model('Token', schema)

export default Token
