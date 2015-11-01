import request from 'supertest'
import db,{setup,teardown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user'
import appMock from '../utils/app.test'

describe('Errors', () => {
  const app = appMock()

  before(done => {
    routes.users(app)

    setup(done)
  })

  after(teardown)

  describe('Duplicate', () => {

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
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          res.body.should.have.property('errors')
          res.body.errors.should.be.an.Array()
          res.body.errors.should.have.length(1)
          res.body.errors[0].should.have.properties(['code', 'message'])

          done()
        })
    })

  })
})
