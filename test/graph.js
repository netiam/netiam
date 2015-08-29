import request from 'supertest'
import db,{teardown} from './utils/db.test'
import routes from './utils/routes'

describe('Graph', function() {
  const app = require('./utils/app.test')()

  before(() => {
    routes.graph(app)
  })

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
