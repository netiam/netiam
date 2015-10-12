import request from 'supertest'
import app from './utils/app'
import {setup,teardown} from './utils/db'
import routes from './utils/routes'

describe('Graph', function() {

  before(setup)
  after(teardown)

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
