import request from 'supertest'
import {teardown} from '../utils/db'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'

export default function() {
  const app = require('../utils/app')()

  before(() => {
    routes.auto(app)
  })
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
