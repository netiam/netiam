import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'
import adapter from 'sails-memory'
import routes from './routes'
import {db} from '../../src/netiam'
import Client from '../../src/db/collections/client'
import Role from '../../src/db/collections/role'
import Token from '../../src/db/collections/token'
import User from '../../src/db/collections/user'

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

db.load(Client, Role, Token, User)

app.use(passport.initialize())
app.use(db.init({config}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

routes.resources(app)
routes.users(app)

export default app
