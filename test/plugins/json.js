import request from 'supertest'
import app from '../utils/app'
import roles from '../../src/rest/roles'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
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
  after(teardown)

  it('should create a user', function(done) {
    request(app)
      .post('/users')
      .send(userFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties([
          'id',
          'name',
          'email',
          'description',
          'role'
        ])

        userId = res.body.id

        done()
      })
  })

  it('should get users - plain', function(done) {
    request(app)
      .get('/plain-users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Array()
        res.body.should.have.length(1)

        done()
      })
  })

  it('should get users - typed', function(done) {
    request(app)
      .get('/typed-users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('user')
        res.body.user.should.be.an.Array()
        res.body.user.should.have.length(1)

        done()
      })
  })

  it('should get a user - plain', function(done) {
    request(app)
      .get('/plain-users/' + userId)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('id')

        done()
      })
  })

  it('should modify a user - typed', function(done) {
    const modifiedUser = Object.assign({}, userFixture, {name: 'modified name'})

    request(app)
      .put('/typed-users/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('user')
        res.body.user.should.be.an.Object()
        res.body.user.should.have.property('id')

        done()
      })
  })

}
