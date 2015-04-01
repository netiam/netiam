'use strict'

let _ = require('lodash')
let express = require('express')
let bodyParser = require('body-parser')
let app = express()
let server = require('http').createServer(app)

export default function(opts) {
  opts = _.extend({
    port: 3001
  }, opts)

  require('./db.test')

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  // Error handling
  app.use(function(err, req, res, next) {
    res
      .status(500)
      .json({
        code:    500,
        status:  'INTERNAL SERVER ERROR',
        message: err.message,
        data:    err.stack
      })
  })

  server.listen(opts.port)

  return app
}
