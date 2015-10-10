import express from 'express'
import bodyParser from 'body-parser'
import adapter from 'sails-memory'
import routes from './routes'
import {db} from '../../src/netiam'

const app = express()
const config = {
  adapters: {
    'default': adapter
  },
  connections: {
    'default': {
      adapter: 'default'
    }
  }
}

app.use(db.init({config}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

routes.resources(app)
routes.users(app)

export default app
