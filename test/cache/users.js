import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import roles from '../../src/rest/roles'
import userFixture from '../fixtures/user.json'

export default function() {

  before(done => {
    setup()
      .then(() => db.collections.role.find({}))
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
  })
  after(teardown)

  it('should create a user', done => {
    request(app)
      .post('/users')
      .send(userFixture)
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

        done()
      })
  })

  it('should get users', done => {
    request(app)
      .get('/cache-users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should
          .be.instanceOf(Array)
          .and.have.lengthOf(1)

        done()
      })
  })

  it('should get cached users', done => {
    request(app)
      .get('/cache-users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Cache', /[a-z0-9]{32}/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should
          .be.instanceOf(Array)
          .and.have.lengthOf(1)

        done()
      })
  })

}
