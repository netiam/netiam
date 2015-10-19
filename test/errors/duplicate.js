import request from 'supertest'
import app from '../utils/app'
import roles from '../../src/rest/roles'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import userFixture from '../fixtures/user'

describe('Errors', () => {

  before(done => {
    setup()
      .then(() => {
        return db.collections.role.find({})
      })
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
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
          res.body.errors[0].should.have.properties([
            'value',
            'rule',
            'message'
          ])

          done()
        })
    })

  })
})
