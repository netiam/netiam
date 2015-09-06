import request from 'supertest'
import db,{teardown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'

export default function() {
  const app = require('../utils/app.test')()

  before(() => {
    routes.users(app)
  })
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
      .end(err => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

}
