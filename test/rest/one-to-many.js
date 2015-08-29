import request from 'supertest'
import db,{tearDown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'
import projectFixture from '../fixtures/project.json'

describe('REST', function() {
  const app = require('../utils/app.test')()
  let projectId

  before(() => {
    routes.users(app)
    routes.projectsOneToMany(app)
  })

  after(tearDown)

  describe('subresource - one to many', function() {
    let userId

    it('should create a project', function(done) {
      request(app)
        .post('/projects')
        .send(projectFixture)
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

    it('should create user', function(done) {
      const userWithProject = Object.assign(userFixture, {project: projectId})

      request(app)
        .post('/users')
        .send(userWithProject)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          userId = res.body.id

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
