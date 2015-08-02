import request from 'supertest'
import db from './utils/db.test'
import routes from './utils/routes'

describe('Graph', function() {
  const app = require('./utils/app.test')()

  before(function(done) {
    routes.graph(app)

    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  after(function(done) {
    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  describe('SVG', function() {

    it('should render a graph', function(done) {
      request(app)
        .get('/graph')
        .expect(200)
        .expect('Content-Type', /svg/)
        .end(function(err) {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })

})
