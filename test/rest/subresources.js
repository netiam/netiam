import request from 'supertest'
import User from '../models/user'
import Project from '../models/project'
import db from '../utils/db.test'
import api from '../../src/netiam'
import * as Resource from '../../src/rest/resource'

describe('rest', function() {
  let userFixture = require('../fixtures/user.json')
  let projectFixture = require('../fixtures/project.json')
  let app = require('../utils/app.test')({port: 3001})
  let projectId

  this.timeout(10000)

  before(function(done) {
    app.post(
      '/projects',
      api()
        .rest({collection: Project})
        .map.res({_id: 'id'})
        .json()
    )

    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/projects',
      api()
        .rest({collection: Project})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/projects/:project/users',
      api()
        .rest({
          collection: Project,
          relationship: Resource.MANY_TO_ONE,
          relationshipField: 'users',
          relationshipCollection: User,
          map: {'_id': ':project'}
        })
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: Project,
          relationship: Resource.MANY_TO_ONE,
          relationshipField: 'users',
          relationshipCollection: User,
          map: {'_id': ':project'}
        })
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
    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  describe('subresource - many to one', function() {
    const users = []
    for (let i = 0; i < 3; i += 1) {
      users.push(userFixture)
    }
    let projectWithUsers
    let userId

    it('should create user', function(done) {
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

          userId = res.body.id
          projectWithUsers = Object.assign(projectFixture, {users: [userId]})

          done()
        })
    })

    it('should create a project', function(done) {
      request(app)
        .post('/projects')
        .send(projectWithUsers)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.have.properties({
            'name': 'testproject'
          })

          projectId = res.body.id

          done()
        })
    })

    it('should get projects', function(done) {
      request(app)
        .get('/projects')
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

    it('should get users', function(done) {
      request(app)
        .get('/projects/' + projectId + '/users')
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
        .get('/projects/' + projectId + '/users/' + userId)
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

  })

})
