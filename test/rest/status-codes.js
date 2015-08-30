import request from 'supertest'
import db,{teardown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'

describe('REST', function() {
  const app = require('../utils/app.test')()

  before(() => {
    routes.users(app)
  })
  after(teardown)

  describe('Status Codes', () => {

    it('should create user', done => {
      const invalidUser = Object.assign({}, userFixture, {email: 'wrong@user'})

      request(app)
        .post('/users')
        .send(invalidUser)
        .set('Accept', 'application/json')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          console.log(res.body)
          done()
        })
    })

  })
})
