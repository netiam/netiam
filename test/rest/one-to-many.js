import request from 'supertest'
import db,{teardown} from '../utils/db.test'
import routes from '../utils/routes'
import userFixture from '../fixtures/user.json'
import projectFixture from '../fixtures/project.json'
import appMock from '../utils/app.test'

export default function() {

  const app = appMock()
  let projectId
  let userId

  before(() => {
    routes.users(app)
    routes.projectsOneToMany(app)
  })
  after(teardown)

  it('should create a project', done => {
    request(app)
      .post('/projects')
      .send(projectFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
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

  it('should create a user', done => {
    request(app)
      .post('/projects/' + projectId + '/users')
      .send(userFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        userId = res.body.id

        done()
      })
  })

  it('should get users', done => {
    request(app)
      .get('/projects/' + projectId + '/users')
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
      .get('/projects/' + projectId + '/users/' + userId)
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
      .get('/projects/' + projectId + '/users-idParam/' + userId)
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
    const modifiedUser = Object.assign(
      {},
      userFixture,
      {name: 'modified user'}
    )

    request(app)
      .put('/projects/' + projectId + '/users/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          'name': 'modified user',
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
    const modifiedUser = Object.assign(
      {},
      userFixture,
      {name: 'modified user 2'}
    )

    request(app)
      .put('/projects/' + projectId + '/users-idParam/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          'name': 'modified user 2',
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
      .delete('/projects/' + projectId + '/users/' + userId)
      .set('Accept', 'application/json')
      .expect(204)
      .end(err => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('should not get a user', done => {
    request(app)
      .get('/projects/' + projectId + '/users/' + userId)
      .set('Accept', 'application/json')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(err => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('should create user', done => {
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

        userId = res.body.id

        done()
      })
  })

  it('should create a project', done => {
    const projectWithUser = Object.assign(
      {},
      projectFixture,
      {users: userId}
    )

    request(app)
      .post('/projects')
      .send(projectWithUser)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
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

  it('should delete a user - idParam', done => {
    request(app)
      .delete('/projects/' + projectId + '/users-idParam/' + userId)
      .set('Accept', 'application/json')
      .expect(204)
      .end(err => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('should not get a user - idParam', done => {
    request(app)
      .get('/projects/' + projectId + '/users-idParam/' + userId)
      .set('Accept', 'application/json')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(err => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

}
