import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import passport from 'passport'

export default function(opts) {
  const app = express()
  const server = http.createServer(app)

  opts = Object.assign({
    port: 3001
  }, opts)

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

  server.listen(opts.port)

  return app
}
