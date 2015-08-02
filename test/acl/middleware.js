import request from 'supertest'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
import db from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'

describe('ACL', function() {
  const app = require('../utils/app.test')()

  before(function(done) {
    routes.aclUsers(app)

    fixtures(function(err) {
      if (err) {
        return done(err)
      }

      Role.find({}, function(err, docs) {
        if (err) {
          return done(err)
        }

        roles.set(docs)
        done()
      })
    })
  })

  after(function(done) {
    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  describe('middleware', function() {
    let userId

    it('should create a user', function(done) {
      const userWithRole = Object.assign(userFixture, {role: roles.get('user')})

      request(app)
        .post('/users')
        .send(userWithRole)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
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

    it('should get a user', function(done) {
      request(app)
        .get('/users/' + userId)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.not.have.property('password')

          done()
        })
    })

    it('should get an authenticated user', function(done) {
      request(app)
        .get('/auth-users/' + userId)
        .auth(userFixture.email, userFixture.password)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.not.have.property('password')

          done()
        })
    })

  })

})
