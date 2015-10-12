import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import userFixture from '../fixtures/user.json'

export default function() {

  before(setup)
  after(teardown)

  it('should create a user', done => {
    request(app)
      .post('/users')
      .send(userFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)
      .end(done)
  })

  it('should return a JSON response', done => {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .end(done)
  })

  it('should return a JSONAPI response', done => {
    request(app)
      .get('/users')
      .set('Accept', 'application/vnd.api+json')
      .expect(200)
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .end(done)
  })

}
