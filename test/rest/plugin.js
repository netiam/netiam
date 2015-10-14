import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'

describe('Collections', () => {
  let userId

  before(setup)
  after(teardown)

  it('should create a user', done => {
    request(app)
      .post('/users')
      .send({
        name: 'eliias',
        description: 'Hey, ich bin der Hannes.',
        email: 'test@neti.am'
      })
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        res.body.should.have.properties({
          name: 'eliias',
          description: 'Hey, ich bin der Hannes.',
          email: 'test@neti.am'
        })
        userId = res.body.name
        done()
      })
  })

  it('should fetch users', done => {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        res.body.should.be.Array()
        res.body[0].should.have.properties({
          name: 'eliias',
          description: 'Hey, ich bin der Hannes.',
          email: 'test@neti.am'
        })
        done()
      })
  })

  it('should fetch a user', done => {
    request(app)
      .get('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        res.body.should.have.properties({
          name: 'eliias',
          description: 'Hey, ich bin der Hannes.',
          email: 'test@neti.am'
        })
        done()
      })
  })

  it('should modify a user', done => {
    request(app)
      .patch('/users/' + userId)
      .send({email: 'test2@neti.am'})
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        res.body.should.have.properties({
          name: 'eliias',
          description: 'Hey, ich bin der Hannes.',
          email: 'test2@neti.am'
        })
        done()
      })
  })

  it('should remove a user', done => {
    request(app)
      .delete('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(204)
      .end(done)
  })

  it('should not fetch a user', done => {
    request(app)
      .get('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(done)
  })

})