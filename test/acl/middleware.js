import path from 'path'
import request from 'supertest'
import User from '../models/user'
import api from '../../src/netiam'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
import loader from '../../src/acl/loader/file'
import db from '../utils/db.test'
import userFixture from '../fixtures/user.json'

const acl = loader({path: path.join(__dirname, '../fixtures/acl.json')})

describe('ACL', function() {
  const {app, server} = require('../utils/app.test')({port: 3001})

  this.timeout(10000)

  before(function(done) {

    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .acl.res({
          collection: User,
          acl: acl
        })
        .json()
    )

    app.get(
      '/auth-users/:id',
      api()
        .auth({collection: User})
        .rest({collection: User})
        .map.res({_id: 'id'})
        .acl.res({
          collection: User,
          acl: acl
        })
        .json()
    )

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
    server.close()
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
