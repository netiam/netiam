import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import userFixture from '../fixtures/user'

export default function() {

  before(setup)
  after(teardown)

  it('should fail creating a user', done => {
    const invalidUser = Object.assign(
      {},
      userFixture,
      {email: 'wrong@user'})

    request(app)
      .post('/users')
      .send(invalidUser)
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/)
      .end(done)
  })

  it('should deny permission to delete resource', done => {
    request(app)
      .delete('/resource')
      .set('Accept', 'application/json')
      .expect(403)
      .expect('Content-Type', /json/)
      .end(done)
  })

}
