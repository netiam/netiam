import request from 'supertest'
import db from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user'
import projectFixture from '../fixtures/project'

describe('REST', function() {
  const app = require('../utils/app.test')()
  let projectId

  before(function(done) {
    routes.users(app)
    routes.projectsManyToOne(app)

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
          projectWithUsers = Object.assign(
            {},
            projectFixture,
            {users: [userId]}
          )

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
