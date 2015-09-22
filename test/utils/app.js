import express from 'express'
import bodyParser from 'body-parser'
import adapter from 'sails-memory'
import routes from './routes'
import db from '../../src/db/connection'

export default function() {
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

  app.setup = function(done) {
    db
      .initialize(config)
      .then(() => {
        routes.users(app)
        done()
      })
  }

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  return app
}
