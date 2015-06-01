import _ from 'lodash'
import request from 'supertest'
import User from './models/user'
import db from './utils/db.test'
import api from '../src/netiam'

describe('rest', function() {
  const userFixture = require('./fixtures/user.json')
  const {app, server} = require('./utils/app.test')({port: 3001})
  let userId

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
        .json()
    )

    app.put(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    app.delete(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  after(function(done) {
    server.close(function() {
      db.connection.db.dropDatabase(function(err) {
        if (err) {
          return done(err)
        }
        done()
      })
    })
  })

  describe('users', function() {
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

    it('should get users', function(done) {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should
            .be.instanceOf(Array)
            .and.have.lengthOf(1)

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

    it('should modify a user', function(done) {
      let modifiedUser = _.clone(userFixture)
      modifiedUser.name = 'modified name'

      request(app)
        .put('/users/' + userId)
        .send(modifiedUser)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
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

    it('should delete a user', function(done) {
      request(app)
        .delete('/users/' + userId)
        .set('Accept', 'application/json')
        .expect(204)
        .end(function(err) {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })

})
