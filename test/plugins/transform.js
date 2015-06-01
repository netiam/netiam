import _ from 'lodash'
import request from 'supertest'
import api from '../../src/netiam'

describe('plugins', function() {
  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app.test.js')()
  let userId

  this.timeout(10000)

  before(function() {
    app.get(
      '/transform',
      api()
        .data([1, 3, 5])
        .transform(function(req, res) {
          res.body = res.body.map(function(n) {
            return n + 1
          })
        })
        .json()
    )
  })

  describe('transform', function() {
    it('should add +1 to every number', function(done) {
      request(app)
        .get('/transform')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.be.instanceof(Array)
            .and.have.lengthOf(3)
          res.body.should
            .containDeepOrdered([2, 4, 6])

          done()
        })
    })

  })

})
