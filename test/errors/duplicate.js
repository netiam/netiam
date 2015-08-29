import request from 'supertest'
import db,{setup,tearDown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user'

describe('Errors', () => {
  const app = require('../utils/app.test')()

  before(done => {
    routes.users(app)

    setup(done)
  })

  after(tearDown)

  describe('duplicate', () => {

    it('should create user', done => {
      request(app)
        .post('/users')
        .send(userFixture)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(err => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('should not create the same user again', done => {
      request(app)
        .post('/users')
        .send(userFixture)
        .set('Accept', 'application/json')
        .expect(400)
        .expect('Content-Type', /json/)
        .end(err => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })
})
