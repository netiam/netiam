import request from 'supertest'
import api from '../../src/netiam'

export default function() {
  const app = require('./../utils/app.test.js')()

  before(() => {
    app.get(
      '/transform',
      api()
        .data([1, 3, 5])
        .transform((req, res) => {
          res.body = res.body.map(n => {
            return n + 1
          })
        })
        .json()
    )
  })

  describe('transform', () => {
    it('should add +1 to every number', done => {
      request(app)
        .get('/transform')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          res.body.should.be.instanceof(Array)
          res.body.should.have.lengthOf(3)
          res.body.should.containDeepOrdered([2, 4, 6])

          done()
        })
    })

  })

}
