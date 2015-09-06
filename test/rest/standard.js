import _ from 'lodash'
import request from 'supertest'
import db,{teardown} from './../utils/db.test.js'
import routes from './../utils/routes'

export default function() {
  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app.test.js')()
  let userId

  before(() => {
    routes.users(app)
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

        userId = res.body.id

        done()
      })
  })

  it('should get users', done => {
    request(app)
      .get('/users')
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

  it('should get a user - idParam', done => {
    request(app)
      .get('/users-idParam/' + userId)
      .set('Accept', 'application/json')
      .expect(200)
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

  it('should modify a user', done => {
    let modifiedUser = _.clone(userFixture)
    modifiedUser.name = 'modified name'

    request(app)
      .put('/users/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          'name': 'modified name',
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

  it('should modify a user - idParam', done => {
    let modifiedUser = _.clone(userFixture)
    modifiedUser.name = 'modified name 2'

    request(app)
      .put('/users-idParam/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          'name': 'modified name 2',
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

  it('should delete a user', done => {
    request(app)
      .delete('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(204)
      .end(done)
  })

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

        userId = res.body.id

        done()
      })
  })

  it('should delete a user - idParam', done => {
    request(app)
      .delete('/users-idParam/' + userId)
      .set('Accept', 'application/json')
      .expect(204)
      .end(done)
  })

  it('should not get a user', done => {
    request(app)
      .get('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(done)
  })

}
