import request from 'supertest'
import Graph from './models/graph'
import db from './utils/db.test'
import api from './../src/netiam'
import nodesFixture from './fixtures/nodes.json'

describe('graph', function() {
  const app = require('./utils/app.test')()

  this.timeout(10000)

  before(function(done) {
    app.get(
      '/graph',
      api()
        .data({nodes: nodesFixture})
        .graph()
        .render()
    )

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
