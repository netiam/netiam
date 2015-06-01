import _ from 'lodash'
import request from 'supertest'
import User from './../models/user'
import db from './../utils/db.test.js'
import api from '../../src/netiam'

export default function() {

  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app.test.js')()
  let userId

  before(function(done) {
    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi({collection: User})
    )

    app.get(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi({collection: User})
    )

    app.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi({collection: User})
    )

    app.put(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi({collection: User})
    )

    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
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

  describe('jsonapi', function() {
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

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should.have.properties({
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
            userId = response.data.id
          } catch (err) {
            return done(err)
          }

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

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should
              .be.instanceOf(Array)
              .and.have.lengthOf(1)
          } catch (err) {
            return done(err)
          }

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

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should.have.properties({
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
          } catch (err) {
            return done(err)
          }

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

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should.have.properties({
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
          } catch (err) {
            return done(err)
          }

          done()
        })
    })

  })

}
