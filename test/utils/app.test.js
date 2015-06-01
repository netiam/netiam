import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'

export default function() {
  const app = express()

  require('./db.test')

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(passport.initialize())

  // Error handling
  app.use(function(err, req, res, next) {
    res
      .status(500)
      .json({
        code: 500,
        status: 'INTERNAL SERVER ERROR',
        message: err.message,
        data: err.stack
      })
  })

  return app
}
