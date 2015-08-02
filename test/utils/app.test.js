import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'

export default function() {
  const app = express()

  require('./db.test')

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(passport.initialize())

  return app
}
