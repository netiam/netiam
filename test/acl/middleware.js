import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import roles from '../../src/rest/roles'
import userFixture from '../fixtures/user'

export default function() {
  let userId

  before(done => {
    setup()
      .then(() => db.collections.role.find({}))
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
  })

  it('should create a user', done => {
    const userWithRole = Object.assign(userFixture, {role: roles.get('user')})

    request(app)
      .post('/users')
      .send(userWithRole)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          'name': 'eliias',
          'description': 'Hey, ich bin der Hannes.',
          'email': 'hannes@impossiblearts.com',
          'firstname': 'Hannes',
          'lastname': 'Moser',
          'location': [
            13.0406998,
            47.822352
          ]
        })

        userId = res.body.id

        done()
      })
  })

  it('should get a user', done => {
    request(app)
      .get('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.not.have.property('password')

        done()
      })
  })

  it('should get an authenticated user', done => {
    request(app)
      .get('/users/' + userId)
      .auth(userFixture.email, userFixture.password)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.not.have.property('password')

        done()
      })
  })

}
